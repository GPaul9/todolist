from typing import AsyncGenerator, Optional, List
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import verify_jwt_token
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.repositories.task_repo import TaskRepository
from app.repositories.list_repo import TaskListRepository
from app.repositories.project_repo import ProjectRepository
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.tag_repo import TagRepository
from app.repositories.attachment_repo import AttachmentRepository
from app.repositories.reminder_repo import ReminderRepository

from app.repositories.webpush_repo import WebPushRepository
from app.services.attachment_service import AttachmentService
from app.services.reminder_service import ReminderService
from app.services.security_service import SecurityService
from app.services.tag_service import TagService
from app.services.user_service import UserService
from app.services.task_service import TaskService
from app.services.subtask_service import SubTaskService
from app.services.task_progress_service import TaskProgressService
from app.models.enums import TaskSortType, OrderType, TaskStatus, TaskPriority
from datetime import datetime
from app.models.task import TaskSearchParams
from app.services.webpush_service import WebPushService
from app.storage.minio import MinIOService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ✅ Правильная dependency для БД
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_session() as session:
        try:
            yield session
        finally:
            await session.close()


# ✅ Repository dependency
async def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


# ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: UserService принимает REPO!
async def get_user_service(repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(repo)  # ✅ repo, НЕ db!


# ✅ Получение User из JWT
async def get_current_user(
        token: str = Depends(oauth2_scheme),
        repo: UserRepository = Depends(get_user_repo)
) -> User:
    print("TOKEN =", repr(token))
    try:
        payload = verify_jwt_token(token, token_type="access")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int = payload.get("user_id")
    token_version = payload.get("version")

    user = await repo.get_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.token_version != token_version:
        raise HTTPException(
            status_code=401,
            detail="Сессия истекла или была завершена",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_task_filters(
        search: Optional[str] = None,
        status: Optional[List[TaskStatus]] = Query(None),  # type: ignore
        priority: Optional[List[TaskPriority]] = Query(None),  # type: ignore
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        tags_ids: Optional[List[int]] = Query(None),  # type: ignore
        match_all_tags: bool = False,
        sort_by: TaskSortType = TaskSortType.CREATED_AT,
        order: OrderType = OrderType.DESC,
        page: int = Query(1, ge=1),
        size: int = Query(20, ge=1, le=100),
        archived: bool = False,
) -> TaskSearchParams:
    return TaskSearchParams(
        search=search,
        status=status,
        priority=priority,
        date_from=date_from,
        date_to=date_to,
        tags_ids=tags_ids,
        match_all_tags=match_all_tags,
        sort_by=sort_by,
        order=order,
        page=page,
        size=size,
        archived=archived,
    )


# async def get_project_service(
#         session: AsyncSession = Depends(get_db),
# ) -> ProjectService:
#     project_repo = ProjectRepository(session)
#     tasklist_repo = TaskListRepository(session)
#     task_repo = TaskRepository(session)
#     subtask_repo = SubTaskRepository(session)
#     return ProjectService(
#         project_repo=project_repo,
#         tasklist_repo=tasklist_repo,
#         task_repo=task_repo,
#         subtask_repo=subtask_repo,
#     )

async def get_task_service(
        session: AsyncSession = Depends(get_db),
) -> TaskService:
    task_repo = TaskRepository(session)
    task_list_repo = TaskListRepository(session)
    project_repo = ProjectRepository(session)
    subtask_repo = SubTaskRepository(session)
    tag_repo = TagRepository(session)
    attachment_repo = AttachmentRepository(session)
    reminder_repo = ReminderRepository(session)
    storage_service = MinIOService()

    return TaskService(
        task_repo=task_repo,
        task_list_repo=task_list_repo,
        project_repo=project_repo,
        subtask_repo=subtask_repo,
        tag_repo=tag_repo,
        attachment_repo=attachment_repo,
        reminder_repo=reminder_repo,
        storage_service=storage_service,
    )


def get_subtask_service(
        session: AsyncSession = Depends(get_db)
) -> SubTaskService:
    subtask_repo = SubTaskRepository(session)
    task_repo = TaskRepository(session)
    attachment_repo = AttachmentRepository(session)
    progress_service = TaskProgressService(
        task_repo=task_repo,
        subtask_repo=subtask_repo
    )
    storage_service = MinIOService()
    return SubTaskService(
        subtask_repo=subtask_repo,
        task_repo=task_repo,
        attachment_repo=attachment_repo,
        progress_service=progress_service,
        storage_service=storage_service,
    )


def get_tag_service(
        session: AsyncSession = Depends(get_db),
) -> TagService:
    repo = TagRepository(session)
    return TagService(repo)


def get_security_service() -> SecurityService:
    return SecurityService()


def get_attachment_service(
        session: AsyncSession = Depends(get_db),
        security_service: SecurityService = Depends(get_security_service)
) -> AttachmentService:
    attachment_repo = AttachmentRepository(session)
    task_repo = TaskRepository(session)
    subtask_repo = SubTaskRepository(session)
    storage_service = MinIOService()

    return AttachmentService(
        attachment_repo=attachment_repo,
        task_repo=task_repo,
        subtask_repo=subtask_repo,
        storage_service=storage_service,
        security_service=security_service
    )


def get_reminder_service(
        session: AsyncSession = Depends(get_db)
) -> ReminderService:
    remind_repo = ReminderRepository(session)
    task_repo = TaskRepository(session)
    return ReminderService(
        remind_repo=remind_repo,
        task_repo=task_repo
    )


def get_webpush_service(
        session: AsyncSession = Depends(get_db)
) -> WebPushService:
    webpush_repo = WebPushRepository(session)
    return WebPushService(
        webpush_repo=webpush_repo
    )
