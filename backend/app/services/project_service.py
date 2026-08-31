# app/services/project_service.py
from datetime import datetime, timezone
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectRead
from app.repositories.project_repo import ProjectRepository
from app.repositories.list_repo import TaskListRepository
from app.dependencies import get_db
from app.models.enums import ProjectStatus, SortType, OrderType
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.task_repo import TaskRepository
from app.models.base import Page, PageMeta
from app.core.pagination import build_page_meta


class ProjectService:
    def __init__(
            self,
            project_repo: ProjectRepository,
            tasklist_repo: TaskListRepository,
            task_repo: TaskRepository,
            subtask_repo: SubTaskRepository,
    ):
        self.project_repo = project_repo
        self.tasklist_repo = tasklist_repo
        self.task_repo = task_repo
        self.subtask_repo = subtask_repo

    async def create(
            self,
            *,
            owner_id: int,
            data: ProjectCreate,
    ) -> Project:
        return await self.project_repo.create(
            title=data.title,
            description=data.description,
            owner_id=owner_id,
        )

    async def get_projects_paginated(
            self,
            *,
            owner_id: int,
            page: int,
            count: int,
            sort_by: SortType = SortType.CREATED_AT,
            order: OrderType = OrderType.DESC,
            search: str | None = None,
            statuses: list[ProjectStatus] | None = None,
    ) -> Page[ProjectRead]:

        offset = (page - 1) * count

        rows = await self.project_repo.get_all(
            owner_id=owner_id,
            statuses=statuses,
            sort_by=sort_by,
            order=order,
            search=search,
            offset=offset,
            limit=count
        )

        total_items = await self.project_repo.count_all(
            owner_id=owner_id,
            statuses=statuses,
            search=search
        )

        result = []

        for project, total_tasks, completed_tasks in rows:
            project_schema = ProjectRead.model_validate(project)

            project_schema.total_tasks = total_tasks or 0
            project_schema.completed_tasks = completed_tasks or 0

            result.append(project_schema)

        return Page(
            data=result,
            meta=build_page_meta(total_items, page, count)
        )


    async def get_by_id(
            self,
            *,
            project_id: int,
            owner_id: int,
    ) -> Project:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Access denied")

        return project

    async def get_by_id_with_stats(
            self,
            *,
            project_id: int,
            owner_id: int,
    ) -> ProjectRead:

        project = await self.get_by_id(project_id=project_id, owner_id=owner_id)

        stats = await self.project_repo.get_projects_stats([project.id])

        project_schema = ProjectRead.model_validate(project)

        if project.id in stats:
            project_schema.total_tasks = stats[project.id].total_tasks or 0
            project_schema.completed_tasks = stats[project.id].completed_tasks or 0
        else:
            project_schema.total_tasks = 0
            project_schema.completed_tasks = 0

        return project_schema

    async def update(
            self,
            *,
            project: Project,
            owner_id: int,
            data: ProjectUpdate,
    ) -> Project:
        if project.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Access denied")

        return await self.project_repo.update(
            project,
            **data.model_dump(exclude_unset=True),
        )


    # ---------- ARCHIVE / UNARCHIVE ----------

    async def archive(self, *, project: Project, owner_id: int) -> Project:
        if project.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Access denied")
        if project.status == ProjectStatus.ARCHIVED_BY_USER:
            return project
        # архивация проекта
        project.status = ProjectStatus.ARCHIVED_BY_USER
        project.archived_at = datetime.now(timezone.utc)
        await self.project_repo.update(project)

        # архивация списков задач
        await self.tasklist_repo.archive_list(project.id)

        # Архивация задач
        await self.task_repo.archive_by_project(project.id)

        # Отвязка тегов от архивированной задачи
        await self.task_repo.unlink_all_tags_by_project(project.id)

        # Архивация подзадачи
        await self.subtask_repo.archive_by_project(project.id)

        return project

    async def unarchive(self, *, project: Project, owner_id: int) -> Project:
        if project.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # разархивировать можно только то, что архивировано пользователем
        if project.status != ProjectStatus.ARCHIVED_BY_USER:
            return project

        # разархивация проекта
        project.status = ProjectStatus.ACTIVE
        project.archived_at = None
        await self.project_repo.update(project)

        # разархивация списки задач
        await self.tasklist_repo.unarchive_list(project.id)

        # разархивация задачи
        await self.task_repo.unarchive_by_project(project.id)

        # разархивация подзадачи
        await self.subtask_repo.unarchive_by_project(project.id)

        return project

    async def delete(self, *, project_id: int, owner_id: int) -> None:
        project = await self.get_by_id(project_id=project_id, owner_id=owner_id)

        if project.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Access denied")
        if project.status != ProjectStatus.ARCHIVED_BY_USER and project.status != ProjectStatus.ARCHIVED_BY_CASCADE:
            raise HTTPException(status_code=400, detail="Project not archived")

        await self.project_repo.delete(project)


async def get_project_service(
        session: AsyncSession = Depends(get_db),
) -> ProjectService:
    project_repo = ProjectRepository(session)
    tasklist_repo = TaskListRepository(session)
    task_repo = TaskRepository(session)
    subtask_repo = SubTaskRepository(session)
    return ProjectService(
        project_repo=project_repo,
        tasklist_repo=tasklist_repo,
        task_repo=task_repo,
        subtask_repo=subtask_repo,
    )
