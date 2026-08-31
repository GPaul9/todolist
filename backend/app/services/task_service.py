from app.core.exceptions.tag import TagNotFoundError
from app.models.enums import AttachmentParentType, TaskListStatus
from app.models.task import Task, TaskCreate, TaskUpdate, \
    TaskResponse, TaskReorder, TaskSearchParams
from app.models.user import User
from app.repositories.attachment_repo import AttachmentRepository
from app.repositories.list_repo import TaskListRepository
from app.repositories.project_repo import ProjectRepository
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.tag_repo import TagRepository
from app.repositories.task_repo import TaskRepository
from app.repositories.reminder_repo import ReminderRepository
from app.core.exceptions.task import TaskAlreadyInTaskListError, TaskArchivedError, \
    TaskProjectArchivedError, TaskTagLimitError, TaskTagAlreadyExistsError, \
    TaskTagNotFoundError, ProjectNotOwnerError, TaskNotFoundError, TaskListNotFoundError, \
    TaskListArchivedError
from app.models.base import Page
from app.core.pagination import build_page_meta
from app.storage.minio import MinIOService
from app.utils.response_builders import build_task_response


class TaskService:
    """Асинхронный сервис для работы с задачами"""

    def __init__(
            self,
            task_repo: TaskRepository,
            task_list_repo: TaskListRepository,
            project_repo: ProjectRepository,
            subtask_repo: SubTaskRepository,
            tag_repo: TagRepository,
            attachment_repo: AttachmentRepository,
            reminder_repo: ReminderRepository,
            storage_service: MinIOService,
    ):
        self.task_repo = task_repo
        self.task_list_repo = task_list_repo
        self.project_repo = project_repo
        self.subtask_repo = subtask_repo
        self.tag_repo = tag_repo
        self.attachment_repo = attachment_repo
        self.reminder_repo = reminder_repo
        self.storage_service = storage_service

    async def _validate_project_access(
            self,
            task_list_id: int,
            user_id: int,
            check_archived: bool = True,
    ) -> None:
        """Проверка доступа к проекту через список задач."""
        task_list = await self.task_list_repo.get_by_id(task_list_id)
        if not task_list:
            raise TaskListNotFoundError()
        if check_archived and task_list.status != TaskListStatus.ACTIVE:
            raise TaskListArchivedError()
        if not await self.project_repo.is_owner(task_list.project_id, user_id):
            raise ProjectNotOwnerError()
        if check_archived and await self.project_repo.is_archived(task_list.project_id):
            raise TaskProjectArchivedError()
        

    async def _get_task(self, task_id: int, user_id: int):
        row = await self.task_repo.get_by_id(
            task_id=task_id,
            user_id=user_id
        )
        if not row:
            raise TaskNotFoundError()
        return row # type: ignore

    async def create_task(
            self,
            list_id: int,
            task: TaskCreate,
            current_user: User
    ) -> TaskResponse:
        """Создание задачи. Нельзя создавать задачу в архивном проекте.
        """
        await self._validate_project_access(
            list_id,
            current_user.id,  # type: ignore
            check_archived=True
        )

        task_data = task.model_dump()
        db_task = Task(
            **task_data,
            task_list_id=list_id,
            position=await self.task_repo.get_next_position(list_id)
        )

        task_db = await self.task_repo.create(db_task)

        return build_task_response(
            task_db, 0, 0, 0, 0
        )

    async def get_tasks_by_list_id(
            self,
            list_id: int,
            filters: TaskSearchParams,
            current_user: User
    ) -> Page[TaskResponse]:
        """Получение задач списка с пагинацией с фильтром и поиском"""
        rows, total = await self.task_repo.search_and_filter(
            user_id=current_user.id,  # type: ignore
            filters=filters,
            list_id=list_id
        )

        tasks_response = list()
        for row in rows:
            task_response = build_task_response(
                row[0], row[1], row[2], row[3], row[4]
            )
            tasks_response.append(task_response)

        return Page[TaskResponse](
            data=tasks_response,
            meta=build_page_meta(total, filters.page, filters.size),
        )

    async def update_task(
            self,
            task_data: TaskUpdate,
            task_id: int,
            current_user: User
    ) -> TaskResponse:
        """Обновление задачи"""
        row = await self._get_task(task_id, current_user.id)  # type: ignore
        db_task = row[0]

        await self._validate_project_access(
            db_task.task_list_id,
            user_id=current_user.id,  # type: ignore
            check_archived=True
        )

        update_data = task_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_task, field, value)

        task = await self.task_repo.update(db_task)

        row = await self._get_task(task.id, current_user.id) # type: ignore
        task_db, ts, cs, ta, tr = row

        task_response = build_task_response(
            task_db, ts, cs, ta, tr
        )

        return task_response

    async def reorder_task(
            self,
            task_id: int,
            reorder_data: TaskReorder,
            current_user: User
    ) -> TaskResponse:
        """Перетаскивание задачи из одного списка в другой.
        Перетаскивать архивную задачу или в архивный список запрещается"""
        row = await self._get_task(task_id, current_user.id)  # type: ignore
        
        db_task = row[0]
        if db_task.is_archived:
            raise TaskArchivedError()
        
        await self._validate_project_access(
            db_task.task_list_id,
            user_id=current_user.id,  # type: ignore
            check_archived=True
        )        

        if reorder_data.new_task_list_id is not None:
            await self._validate_project_access(
                reorder_data.new_task_list_id,
                user_id=current_user.id,  # type: ignore
                check_archived=True
            )

        if reorder_data.new_task_list_id == db_task.task_list_id:
            raise TaskAlreadyInTaskListError()

        if (reorder_data.new_task_list_id is not None
                and reorder_data.new_task_list_id != db_task.task_list_id):
            db_task.task_list_id = reorder_data.new_task_list_id

        db_task = await self.task_repo.update(db_task)

        row = await self._get_task(db_task.id, current_user.id) # type: ignore
        task_db, ts, cs, ta, tr = row

        task_response = build_task_response(
            task_db, ts, cs, ta, tr
        )

        return task_response

    async def delete_task(
            self,
            task_id: int,
            current_user: User
    ) -> None:
        """Удаление задачи"""
        row = await self._get_task(task_id, current_user.id)  # type: ignore

        db_task = row[0]
        if db_task.is_archived:
            raise TaskArchivedError()

        await self.task_repo.unlink_all_tags(task_id)

        attachments = await self.attachment_repo.get_by_parent(
            parent=AttachmentParentType.task,
            parent_id=task_id,
            user_id=current_user.id # type: ignore
        )

        for attachment in attachments:
            await self.storage_service.delete(s3_key=attachment.s3_key)
        
        await self.attachment_repo.delete_all_by_parent(
            parent_type=AttachmentParentType.task,
            parent_id=task_id
        )

        await self.task_repo.delete(db_task)

    async def search_task(
            self,
            filters: TaskSearchParams,
            current_user: User,
    ) -> Page[TaskResponse]:
        """Поиск и фильтрация задач"""
        rows, total = await self.task_repo.search_and_filter(
            user_id=current_user.id,  # type: ignore
            filters=filters
        )

        tasks_response = list()
        for row in rows:
            task_response = build_task_response(
                row[0], row[1], row[2], row[3], row[4]
            )
            tasks_response.append(task_response)

        return Page[TaskResponse](
            data=tasks_response,
            meta=build_page_meta(total, filters.page, filters.size),
        )

    async def add_tag_to_task(
            self,
            task_id: int,
            tag_id: int,
            current_user: User,
    ) -> TaskResponse:
        """Добавление тега к задаче"""
        row = await self._get_task(task_id, current_user.id)  # type: ignore

        db_task = row[0]
        if db_task.is_archived:
            raise TaskArchivedError()

        tag_row = await self.tag_repo.get_by_id(
            tag_id=tag_id, user_id=current_user.id)  # type: ignore
        if not tag_row:
            raise TagNotFoundError(tag_id)

        link = await self.task_repo.get_tasks_tag(task_id, tag_id)
        if link:
            raise TaskTagAlreadyExistsError()

        tags = await self.task_repo.get_all_tags(task_id)
        if len(tags) >= 25:  # type: ignore
            raise TaskTagLimitError()

        await self.task_repo.add_tag(
            task_id=task_id,
            tag_id=tag_id
        )

        row = await self._get_task(task_id, current_user.id) # type: ignore

        task_db, ts, cs, ta, tr = row
        task_response = build_task_response(
            task_db, ts, cs, ta, tr
        )

        return task_response

    async def remove_tag_from_task(
            self,
            task_id: int,
            tag_id: int,
            current_user: User
    ) -> TaskResponse:
        """Удаление тега у задачи"""
        row = await self._get_task(task_id, current_user.id)  # type: ignore

        db_task = row[0]
        if db_task.is_archived:
            raise TaskArchivedError()

        link = await self.task_repo.get_tasks_tag(task_id, tag_id)
        if not link:
            raise TaskTagNotFoundError()

        await self.task_repo.remove_tag(
            link
        )

        row = await self._get_task(db_task.id, current_user.id) # type: ignore
        task_db, ts, cs, ta, tr = row

        task_response = build_task_response(
            task_db, ts, cs, ta, tr
        )

        return task_response

    async def get_task_by_id(self, task_id: int, current_user: User) -> TaskResponse:
        """Получение задачи по её ID"""
        result = await self._get_task(task_id, current_user.id) # type: ignore
        
        task, total_subtasks, completed_subtasks, total_attachments, total_reminders = result

        return build_task_response(
            task, total_subtasks, completed_subtasks, total_attachments, total_reminders
        )
