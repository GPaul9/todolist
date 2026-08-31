from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from starlette import status

from app.dependencies import get_current_user, get_attachment_service
from app.models.attachment import AttachmentUpload, AttachmentCreate, AttachmentResponse,\
    AttachmentWithTaskResponse, AttachmentWithSubTaskResponse, Attachment
from app.models.enums import AttachmentParentType
from app.models.user import User
from app.services.attachment_service import AttachmentService


class UploadUrlResponse(BaseModel):
    presigned_upload_url: str
    uploaded: AttachmentUpload


class DownloadUrlResponse(BaseModel):
    presigned_download_url: str
    downloaded: AttachmentResponse


router = APIRouter(tags=["attachments"])


@router.post("/attachments/upload-url",
             response_model=UploadUrlResponse,
             summary="Получение ссылки для загрузки файла",
             )
async def get_presigned_upload_url(
        attachment_create: AttachmentCreate,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> dict:
    return await service.generate_upload_url(
            attachment_create,
            current_user
    )


@router.post("/attachments/confirm",
             response_model=AttachmentResponse,
             summary="Подтверждение загрузки файла в хранилище "
                     "и создание вложения в бд")
async def confirm_upload(
        attachment_upload: AttachmentUpload,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> Attachment:
    return await service.confirm_upload(
            attachment_upload,
            current_user
    )


@router.get("/tasks/{task_id}/attachments",
            response_model=list[AttachmentResponse],
            summary="Возвращает список вложений задачи",
            description="Возвращает список представлений вложений задачи из бд, а не из хранилища."
                        "Представление вложений содержит всю необходимую информацию о вложении,"
                        "без самой ссылки для скачивания"
            )
async def get_task_attachments(
        task_id: int,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> list[Attachment]:
    return await service.get_attachments(
        AttachmentParentType.task,
        task_id,
        current_user
    )


@router.get("/subtasks/{subtask_id}/attachments",
            response_model=list[AttachmentResponse],
            summary="Возвращает список вложений подзадачи",
            description="Возвращает список представлений вложений подзадачи из бд, а не из хранилища."
                        "Представление вложений содержит всю необходимую информацию о вложении,"
                        "без самой ссылки для скачивания"
            )
async def get_subtask_attachments(
        subtask_id: int,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> list[Attachment]:
    return await service.get_attachments(
        AttachmentParentType.subtask,
        subtask_id,
        current_user
    )


@router.delete("/tasks/{task_id}/attachments/{attachment_id}",
               status_code=status.HTTP_200_OK,
               summary="Удаляет вложение по id"
               )
async def delete_task_attachment(
        task_id: int,
        attachment_id: UUID,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentWithTaskResponse:
    return await service.delete_task_attachment(
        task_id,
        attachment_id,
        current_user
    )

@router.delete("/subtasks/{subtask_id}/attachments/{attachment_id}",
               status_code=status.HTTP_200_OK,
               summary="Удаляет вложение по id"
               )
async def delete_subtask_attachment(
        subtask_id: int,
        attachment_id: UUID,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentWithSubTaskResponse:
    return await service.delete_subtask_attachment(
        subtask_id,
        attachment_id,
        current_user
    )


@router.get("/attachments/{attachment_id}/download",
            response_model=DownloadUrlResponse,
            summary="Возвращает ссылку на скачивания файла из хранилища"
            )
async def get_attachment_download_url(
        attachment_id: UUID,
        current_user: User = Depends(get_current_user),
        service: AttachmentService = Depends(get_attachment_service),
) -> dict:
    return await service.get_download_url(
            attachment_id,
            current_user
    )
