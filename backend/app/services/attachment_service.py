from datetime import datetime, timezone
from pathlib import Path
from typing import List
from uuid import uuid4, UUID

from app.models.attachment import Attachment, AttachmentCreate, AttachmentUpload, \
    AttachmentWithTaskResponse, AttachmentWithSubTaskResponse, AttachmentResponse
from app.models.enums import AttachmentParentType
from app.models.user import User
from app.repositories.attachment_repo import AttachmentRepository
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.task_repo import TaskRepository
from app.services.security_service import SecurityService
from app.storage.minio import MinIOService
from app.core.exceptions.attachment import(
    AttachmentParentArchivedError,
    AttachmentParentNotFoundError,
    AttachmentSecurityError,
    AttachmentSubTaskCountError,
    AttachmentTaskCountError,
    AttachmentNotFoundError,
    AttachmentNotOwnerError,
    AttachmentParentTypeError,
    AttachmentParentIDError,
    AttNotFoundInStorageError,
    AttachmentAlreadyConfirmedError,
)
from app.models.subtask import SubTaskResponse
from app.models.task import TaskResponse
from app.utils.response_builders import build_task_response


class AttachmentService:

    def __init__(
            self,
            attachment_repo: AttachmentRepository,
            task_repo: TaskRepository,
            subtask_repo: SubTaskRepository,
            storage_service: MinIOService,
            security_service: SecurityService,
    ):
        self.attachment_repo = attachment_repo
        self.task_repo = task_repo
        self.subtask_repo = subtask_repo
        self.storage_service = storage_service
        self.security_service = security_service
    
    async def _validate_attachment_for_deletion(
            self,
            attachment_id: UUID,
            parent_type: AttachmentParentType,
            parent_id: int,
            current_user: User
    ) -> Attachment:
        db_attachment = await self.attachment_repo.get_attachment_by_id(
            attachment_id, current_user.id # type: ignore
        )
        if db_attachment is None:
            raise AttachmentNotFoundError()
        if db_attachment.uploaded_by != current_user.id:
            raise AttachmentNotOwnerError()
        if db_attachment.parent_type != parent_type:
            raise AttachmentParentTypeError()
        if db_attachment.parent_id != parent_id:
            raise AttachmentParentIDError()
        
        return db_attachment

    async def _get_task_with_aggregates(
            self, 
            task_id: int, 
            user_id: int
            ):
        task_row = await self.task_repo.get_by_id(
            task_id, user_id) # type: ignore
        if not task_row:
            raise AttachmentParentNotFoundError("_get_task_with_aggregates")
        return task_row

    async def _build_task_response(
            self,
            task_id: int,
            user_id: int
            ) -> TaskResponse:
        data_task = await self._get_task_with_aggregates(task_id, user_id)
        
        task_obj, ts, cs, ta, tr = data_task
        return build_task_response(task_obj, ts, cs, ta, tr)
        

    async def _build_attachment_with_task(
            self,
            db_attachment: Attachment,
            current_user: User
    ) -> AttachmentWithTaskResponse:
        att_resp = AttachmentResponse.model_validate(db_attachment)
        return AttachmentWithTaskResponse(
            attachment=att_resp, 
            task=await self._build_task_response(db_attachment.parent_id, current_user.id) # type: ignore
            )

    async def _build_attachment_with_subtask(
            self,
            db_attachment: Attachment,
            current_user: User
    ) -> AttachmentWithSubTaskResponse:
        subtask = await self.subtask_repo.get_by_id(db_attachment.parent_id, current_user.id) # type: ignore
        if not subtask:
            raise AttachmentParentNotFoundError("_build_attachment_with_subtask")

        subtask_resp = SubTaskResponse.model_validate(subtask)
        attachments = await self.attachment_repo.get_by_parent(
            AttachmentParentType.subtask, subtask.id, current_user.id # pyright: ignore[reportArgumentType]
        )
        subtask_resp.attachments = [
            AttachmentResponse.model_validate(a) for a in attachments
            ]

        att_resp = AttachmentResponse.model_validate(db_attachment)
        return AttachmentWithSubTaskResponse(
            attachment=att_resp,
            subtask=subtask_resp,
            task=await self._build_task_response(
                subtask.task_id, current_user.id) # type: ignore
        )

    async def generate_upload_url(
            self,
            attachment: AttachmentCreate,
            current_user: User,
    ) -> dict:
        """Генерирует ссылку для загрузки в хранилище"""
        # Check parent
        if attachment.parent_id is None:
            raise AttachmentParentIDError()

        # Check exists parent and check owner
        if attachment.parent_type == AttachmentParentType.task:
            parent_row = await self.task_repo.get_by_id(
                attachment.parent_id, current_user.id # type: ignore
            )
            if parent_row is None:
                raise AttachmentParentNotFoundError("generate_upload_url")
            parent = parent_row[0] # type: ignore
        else:
            parent = await self.subtask_repo.get_by_id(
                attachment.parent_id, current_user.id # type: ignore
            )
            if parent is None:
                raise AttachmentParentNotFoundError("generate_upload_url")
        
        if parent.is_archived:
            raise AttachmentParentArchivedError()

        # Check limits attachments for this parent type
        count = await self.attachment_repo.count_by_parent(
            attachment.parent_type, attachment.parent_id
        )
        if attachment.parent_type == AttachmentParentType.task and count >= 5:
            raise AttachmentTaskCountError()
        if attachment.parent_type == AttachmentParentType.subtask and count >= 1:
            raise AttachmentSubTaskCountError()
        
        path = Path(attachment.original_filename.strip())

        # Generate s3_key
        extension = path.suffix
        qarantine_key = f'quarantine/{uuid4()}{extension}'

        db_attachment = Attachment(
            **attachment.model_dump(),
            s3_key=qarantine_key,
            uploaded_by=current_user.id, # type: ignore
            confirmed_at=None
        )

        await self.attachment_repo.create(db_attachment)

        presigned_upload_url = await self.storage_service.generate_presigned_upload_url(
            s3_key=qarantine_key
        )

        return {
            "presigned_upload_url": presigned_upload_url,
            "uploaded": AttachmentUpload.model_validate(db_attachment)
        }


    async def confirm_upload(
            self,
            attachment: AttachmentUpload,
            current_user: User
    ) -> Attachment:
        # Check that attachment in MinIO
        if not await self.storage_service.exists(attachment.s3_key):
            raise AttNotFoundInStorageError()

        existing = await self.attachment_repo.get_by_s3_key(attachment.s3_key)
        if not existing:
            raise AttachmentNotFoundError()
        if existing.confirmed_at is not None:
            raise AttachmentAlreadyConfirmedError()
        if existing.uploaded_by != current_user.id:
            raise AttachmentNotOwnerError()

        file_data = await self.storage_service.get_object(existing.s3_key)

        try:
            await self.security_service.validate_file_content(
                file_data, 
                existing.original_filename, 
                existing.mime_type,
                existing.size
            )
        except AttachmentSecurityError:
            await self.storage_service.delete(existing.s3_key)
            await self.attachment_repo.delete(existing)
            raise
        
        ext = Path(existing.original_filename).suffix

        final_3s_key = (f'attachments/{existing.parent_type.value}/'
                        f'{existing.parent_id}/{uuid4()}{ext}')


        await self.storage_service.copy_to_main(
            existing.s3_key, final_3s_key
            )
        
        existing.s3_key = final_3s_key
        existing.confirmed_at = datetime.now(timezone.utc)

        await self.attachment_repo.update(existing)

        await self.storage_service.delete(attachment.s3_key)

        return existing

    async def delete_task_attachment(
            self,
            parent_id: int,
            attachment_id: UUID,
            current_user: User
    ) -> AttachmentWithTaskResponse:
        db_attachment = await self._validate_attachment_for_deletion(
            attachment_id, AttachmentParentType.task, parent_id, current_user
        )

        await self.attachment_repo.delete(db_attachment)
        await self.storage_service.delete(db_attachment.s3_key)

        response = await self._build_attachment_with_task(
            db_attachment, current_user
        )

        return response
    
    async def delete_subtask_attachment(
            self,
            parent_id: int,
            attachment_id: UUID,
            current_user: User
    ) -> AttachmentWithSubTaskResponse:
        db_attachment = await self._validate_attachment_for_deletion(
            attachment_id, AttachmentParentType.subtask, parent_id, current_user
        )

        await self.attachment_repo.delete(db_attachment)
        await self.storage_service.delete(db_attachment.s3_key)

        response = await self._build_attachment_with_subtask(
            db_attachment, current_user
        )

        return response

    async def get_attachments(
            self,
            parent_type: AttachmentParentType,
            parent_id: int,
            current_user: User
    ) -> List[Attachment]:
        parent = None
        if parent_type == AttachmentParentType.task:
            parent = await self.task_repo.get_by_id(parent_id, current_user.id)     # type: ignore
        else:
            parent = await self.subtask_repo.get_by_id(parent_id, current_user.id) # type: ignore
        if not parent:
            raise AttachmentParentNotFoundError("get_attachments")
        return await self.attachment_repo.get_by_parent(
            parent_type, parent_id, current_user.id # type: ignore
        )

    async def get_download_url(
            self,
            attachment_id: UUID,
            current_user: User
    ) -> dict:
        db_attachment = await self.attachment_repo.get_attachment_by_id(
            attachment_id, current_user.id # type: ignore
        )
        if db_attachment is None:
            raise AttachmentNotFoundError()

        presigned_download_url = await self.storage_service.generate_presigned_download_url(
            s3_key=db_attachment.s3_key
        )

        attachment_response = AttachmentResponse.model_validate(db_attachment)

        return {
            "presigned_download_url": presigned_download_url,
            "downloaded": attachment_response
        }
