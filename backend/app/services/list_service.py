from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list import TaskList, TaskListCreate, TaskListUpdate, TaskListRead
from app.repositories.list_repo import TaskListRepository
from app.repositories.project_repo import ProjectRepository
from app.dependencies import get_db
from app.models.enums import TaskListStatus, ProjectStatus
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.task_repo import TaskRepository
from app.models.base import Page
from app.core.pagination import build_page_meta


class TaskListService:
    def __init__(
            self,
            tasklist_repo: TaskListRepository,
            project_repo: ProjectRepository,
            task_repo: TaskRepository,
            subtask_repo: SubTaskRepository,
    ):
        self.tasklist_repo = tasklist_repo
        self.project_repo = project_repo
        self.task_repo = task_repo
        self.subtask_repo = subtask_repo

    async def create(
            self,
            *,
            project_id: int,
            owner_id: int,
            data: TaskListCreate,
    ) -> TaskList:
        project = await self.project_repo.get_project_only(project_id)
        # Проверка прав
        if not project or project.owner_id != owner_id:
            raise HTTPException(
                status_code=403,
                detail="Project not found or access denied"
            )

        if project.status != ProjectStatus.ACTIVE:
            raise HTTPException(
                status_code=400,
                detail="Project is not active"
            )

        order = await self.tasklist_repo.get_next_order(project_id)

        return await self.tasklist_repo.create(
            project_id=project_id,
            title=data.title,
            order=order,
        )

    # получение списка задач по проекту с пагинацией
    async def get_lists_paginated(
            self,
            *,
            project_id: int,
            owner_id: int,
            page: int,
            count: int,
            statuses: list[TaskListStatus] | None = None,
    ) -> Page[TaskListRead]:

        offset = (page - 1) * count

        rows = await self.tasklist_repo.get_all(
            project_id=project_id,
            owner_id=owner_id,
            statuses=statuses,
            offset=offset,
            limit=count
        )

        total_items = await self.tasklist_repo.count_all(
            project_id=project_id,
            owner_id=owner_id,
            statuses=statuses,
        )

        result = []

        for task_list in rows:  # *_ игнорирует оставшиеся значения кортежа
            list_schema = TaskListRead.model_validate(task_list)
            result.append(list_schema)

        return Page(
            data=result,
            meta=build_page_meta(total_items, page, count)
        )

    # получение списка задач по пользователю с пагинацией
    async def get_lists_by_user(
            self,
            *,
            owner_id: int,
            page: int,
            count: int,
            statuses: list[TaskListStatus] | None = None,
    ) -> Page[TaskListRead]:

        offset = (page - 1) * count

        rows = await self.tasklist_repo.get_all_by_user(
            owner_id=owner_id,
            statuses=statuses,
            offset=offset,
            limit=count
        )

        total_items = await self.tasklist_repo.count_all_by_user(
            owner_id=owner_id,
            statuses=statuses,
        )

        result = []

        for task_list in rows:  # *_ игнорирует оставшиеся значения кортежа
            list_schema = TaskListRead.model_validate(task_list)
            result.append(list_schema)

        return Page(
            data=result,
            meta=build_page_meta(total_items, page, count)
        )


    async def get_by_id(
            self,
            *,
            list_id: int,
            owner_id: int,
    ) -> TaskList:
        task_list = await self.tasklist_repo.get_by_id(list_id)
        if not task_list:
            raise HTTPException(status_code=404, detail="TaskList not found")

        if not await self.project_repo.is_owner(task_list.project_id, owner_id):
            raise HTTPException(status_code=403, detail="Access denied")

        return task_list

    async def update(
            self,
            *,
            task_list: TaskList,
            owner_id: int,
            data: TaskListUpdate,
    ) -> TaskList:
        if not await self.project_repo.is_owner(task_list.project_id, owner_id):
            raise HTTPException(status_code=403, detail="Access denied")

        return await self.tasklist_repo.update(
            task_list,
            **data.model_dump(exclude_unset=True),
        )

    # ---------- ARCHIVE / UNARCHIVE ----------

    async def archive(self, *, task_list: TaskList, owner_id: int) -> TaskList:
        if not await self.project_repo.is_owner(task_list.project_id, owner_id):
            raise HTTPException(status_code=403, detail="Access denied")

        if task_list.status == TaskListStatus.ARCHIVED_BY_USER:
            return task_list

        # Архивация списков задач
        task_list.status = TaskListStatus.ARCHIVED_BY_USER
        await self.tasklist_repo.update(task_list)

        # Архивация задач
        await self.task_repo.archive_by_list(task_list.id)

        # Отвязка тегов от архивированной задачи
        await self.task_repo.unlink_all_tags_by_list(task_list.id)

        # Архивация подзадачи
        await self.subtask_repo.archive_by_list(task_list.id)

        return task_list

    async def unarchive(self, *, task_list: TaskList, owner_id: int) -> TaskList:
        if not await self.project_repo.is_owner(task_list.project_id, owner_id):
            raise HTTPException(status_code=403, detail="Access denied")

        if task_list.status == TaskListStatus.ACTIVE:
            return task_list

        # разархивация списки задач
        task_list.status = TaskListStatus.ACTIVE
        await self.tasklist_repo.update(task_list)

        # разархивация задачи
        await self.task_repo.unarchive_by_list(task_list.id)

        # разархивация подзадачи
        await self.subtask_repo.unarchive_by_list(task_list.id)

        return task_list

    async def delete(self, *, list_id: int, owner_id: int) -> None:
        task_list = await self.get_by_id(list_id=list_id, owner_id=owner_id)
        if (task_list.status != TaskListStatus.ARCHIVED_BY_USER
                and task_list.status != TaskListStatus.ARCHIVED_BY_CASCADE
                and task_list.status != TaskListStatus.ARCHIVED_BY_USER_AND_CASCADE):
            raise HTTPException(status_code=400, detail="List not archived")
        await self.tasklist_repo.delete(task_list)

    async def reorder_lists(
            self,
            *,
            owner_id: int,
            project_id: int,
            ordered_ids: list[int],
    ) -> None:

        # Проверка доступа к проекту
        project = await self.project_repo.get_project_only(project_id)
        if not project or project.owner_id != owner_id:
            raise HTTPException(status_code=404, detail="Project not found or access denied")

        # проверка что все списки принадлежат проекту с лимитом
        lists = await self.tasklist_repo.get_by_project(project_id, limit=500)

        existing_ids = {l.id for l in lists}

        if set(ordered_ids) != existing_ids:
            raise HTTPException(
                status_code=400,
                detail="ordered_ids must contain all project list IDs",
            )

        await self.tasklist_repo.reorder_lists(
            project_id=project_id,
            ordered_ids=ordered_ids,
        )


async def get_tasklist_service(
        session: AsyncSession = Depends(get_db),
) -> TaskListService:
    tasklist_repo = TaskListRepository(session)
    project_repo = ProjectRepository(session)
    task_repo = TaskRepository(session)
    subtask_repo = SubTaskRepository(session)
    return TaskListService(
        tasklist_repo=tasklist_repo,
        project_repo=project_repo,
        task_repo=task_repo,
        subtask_repo=subtask_repo,
    )
