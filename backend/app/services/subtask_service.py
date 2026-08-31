from typing import List

from app.models.attachment import AttachmentResponse
from app.models.enums import AttachmentParentType
from app.models.subtask import SubTaskCreate, SubTask, SubTaskUpdate, \
    SubTaskWithTaskResponse, SubTaskResponse
from app.models.task import Task
from app.models.user import User
from app.repositories.attachment_repo import AttachmentRepository
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.task_repo import TaskRepository
from app.services.task_progress_service import TaskProgressService
from app.core.exceptions.subtask import SubTaskArchivedError, SubTaskNotFoundError, \
    TaskNotFoundError
from app.storage.minio import MinIOService
from app.utils.response_builders import build_task_response


class SubTaskService:
    """Асинхронный сервис для работы с подзадачами"""

    def __init__(
            self,
            subtask_repo: SubTaskRepository,
            task_repo: TaskRepository,
            attachment_repo: AttachmentRepository,
            progress_service: TaskProgressService,
            storage_service: MinIOService,
    ):
        self.subtask_repo = subtask_repo
        self.task_repo = task_repo
        self.attachment_repo = attachment_repo
        self.progress_service = progress_service
        self.storage_service = storage_service

    async def _validate_task(
            self, 
            task: Task
    ) -> None:
        if task.is_archived:
            raise SubTaskArchivedError()
        

    async def _get_task_with_aggregates(
            self,
            task_id: int,
            current_user: User
    ):
        row = await self.task_repo.get_by_id(
            task_id, current_user.id # type: ignore
        )
        if not row:
            raise TaskNotFoundError()
        return row

    async def _build_subtask_response(
            self,
            subtask: SubTask,
            user_id: int
    ) -> SubTaskResponse:
        attachments = await self.attachment_repo.get_by_parent(
            AttachmentParentType.subtask,
            subtask.id,  # type: ignore
            user_id
        )

        attachments_response = [
            AttachmentResponse.model_validate(attachment)
            for attachment in attachments
        ]
        subtask_response = SubTaskResponse.model_validate(subtask)
        subtask_response.attachments = attachments_response

        return subtask_response

    async def _build_subtask_with_task(
            self,
            db_subtask: SubTask,
            current_user: User
    ) -> SubTaskWithTaskResponse:
        subtask_resp = await self._build_subtask_response(
            db_subtask, current_user.id) # type: ignore

        task_row = await self._get_task_with_aggregates(db_subtask.task_id, current_user)
        task_obj, ts, cs, ta, tr = task_row

        task_resp = build_task_response(task_obj, ts, cs, ta, tr)

        return SubTaskWithTaskResponse(
            subtask=subtask_resp,
            task=task_resp
        )

    async def create_subtask(
            self,
            task_id: int,
            subtask: SubTaskCreate,
            current_user: User
    ) -> SubTaskWithTaskResponse:
        """Создание подзадачи"""
        task_row = await self._get_task_with_aggregates(task_id, current_user)
        await self._validate_task(task_row[0])

        db_subtask = SubTask(
            **subtask.model_dump(),
            task_id=task_id,
            position=await self.subtask_repo.get_next_position(task_id)
        )
        db_subtask = await self.subtask_repo.create(db_subtask)

        await self.progress_service.recalc(task_id, current_user.id) # type: ignore

        return await self._build_subtask_with_task(db_subtask, current_user)

    async def get_subtasks_by_task_id(
            self,
            task_id: int,
            current_user: User,
            offset: int = 0,
            limit: int = 50,
    ) -> List[SubTaskResponse]:
        """Получение списка подзадач по id задачи"""
        await self._get_task_with_aggregates(task_id, current_user)

        subtasks = await self.subtask_repo.get_by_task_id(
            task_id=task_id,
            offset=offset - 1,
            limit=limit
        )

        subtasks_response = list()
        for subtask in subtasks:
            subtask_response = await self._build_subtask_response(
                subtask, current_user.id) # type: ignore
            subtasks_response.append(subtask_response)
        return subtasks_response

    async def update_subtask(
            self,
            subtask_id: int,
            subtask: SubTaskUpdate,
            current_user: User
    ) -> SubTaskWithTaskResponse:
        """Обновление подзадачи"""
        db_subtask: SubTask | None = await self.subtask_repo.get_by_id(
            subtask_id=subtask_id,
            user_id=current_user.id # type: ignore
        )
        if not db_subtask:
            raise SubTaskNotFoundError()
        await self._validate_task(db_subtask.task) # type: ignore

        update_data = subtask.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_subtask, field, value)

        updated_subtask = await self.subtask_repo.update(db_subtask)

        await self.progress_service.recalc(
            updated_subtask.task_id, current_user.id) # type: ignore

        return await self._build_subtask_with_task(db_subtask, current_user)

    async def delete(
            self,
            subtask_id: int,
            current_user: User
    ) -> SubTaskWithTaskResponse:
        """Жесткое удаление подзадачи"""
        db_subtask = await self.subtask_repo.get_by_id(
            subtask_id=subtask_id,
            user_id=current_user.id # type: ignore
        )
        if not db_subtask:
            raise SubTaskNotFoundError()

        attachments = await self.attachment_repo.get_by_parent(
            parent=AttachmentParentType.subtask,
            parent_id=subtask_id,
            user_id=current_user.id # type: ignore
        )

        for attachment in attachments:
            await self.storage_service.delete(s3_key=attachment.s3_key)

        await self.attachment_repo.delete_all_by_parent(
            parent_type=AttachmentParentType.subtask,
            parent_id=subtask_id
        )

        await self.subtask_repo.delete(db_subtask)
        await self.progress_service.recalc(db_subtask.task_id, current_user.id) # type: ignore

        response = await self._build_subtask_with_task(db_subtask, current_user)

        return response
