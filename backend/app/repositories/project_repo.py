# app/repositories/project_repo.py
from typing import Sequence

from sqlalchemy import select, func, update, or_, asc, desc

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import case

from app.models.project import Project
from app.models.enums import ProjectStatus, TaskListStatus, SortType, TaskStatus, OrderType
from app.models.list import TaskList
from app.models import Task

class ProjectRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, project_id: int) -> Project | None:
        stmt = select(Project).where(Project.id == project_id)  # type: ignore[arg-type]

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_projects_stats(self, project_ids: list[int]):
        stmt = (
            select(
                TaskList.project_id,
                func.count(Task.id).label("total_tasks"),
                func.count(
                    case((Task.status == TaskStatus.DONE, 1))
                ).label("completed_tasks")
            )
            .join(Task, Task.task_list_id == TaskList.id)
            .where(TaskList.project_id.in_(project_ids))
            .group_by(TaskList.project_id)
        )

        result = await self.session.execute(stmt)
        return {row.project_id: row for row in result}


    async def get_project_only(self, project_id: int) -> Project | None: # возвращает только проект
        stmt = select(Project).where(Project.id == project_id)

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()


    # Возвращает все активные проекты
    async def get_all(
            self,
            *,
            owner_id: int | None = None,
            statuses: list[ProjectStatus] | None = None,
            sort_by: SortType = SortType.CREATED_AT,
            order: OrderType  = OrderType.DESC,
            search: str | None = None,
            offset: int = 0,
            limit: int = 10,
    ):

        stmt = (
            select(
                Project,
                func.count(Task.id).label("total_tasks"),
                func.count(
                    case((Task.status == TaskStatus.DONE, 1))
                ).label("completed_tasks"),
            )
            .outerjoin(TaskList, TaskList.project_id == Project.id)
            .outerjoin(Task, Task.task_list_id == TaskList.id)
            .group_by(Project.id)
        )

        # ===== OWNER =====
        if owner_id is not None:
            stmt = stmt.where(Project.owner_id == owner_id)

        # ===== СТАТУСЫ =====
        if statuses is not None:
            stmt = stmt.where(Project.status.in_(statuses))
        else:
            stmt = stmt.where(
                Project.status.in_([TaskListStatus.ACTIVE]))

        # ===== ПОИСК =====
        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Project.title.ilike(search_pattern),
                    Project.description.ilike(search_pattern),
                )
            )

        # ===== СОРТИРОВКА =====
        if sort_by == SortType.CREATED_AT:
            field  = Project.created_at
        elif sort_by == SortType.TITLE:
            field = Project.title
        elif sort_by == SortType.UPDATED_AT:
            field = Project.updated_at

        else:
            field = Project.created_at  # дефолт

        if order == OrderType.ASC:
            stmt = stmt.order_by(asc(field))
        else:
            stmt = stmt.order_by(desc(field)) # дефолт

        # ===== ПАГИНАЦИЯ =====
        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        return result.all()

    async def is_owner(self, project_id: int, owner_id: int) -> bool:
        stmt = select(Project.id).where(
            Project.id == project_id,
            Project.owner_id == owner_id,
        )
        result = await self.session.execute(stmt)
        return result.first() is not None

    async def create(
            self,
            *,
            title: str,
            description: str | None,
            owner_id: int,
    ) -> Project:
        project = Project(
            title=title,
            description=description,
            owner_id=owner_id,
        )
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def update(self, project: Project, **fields) -> Project:
        for field, value in fields.items():
            setattr(project, field, value)

        await self.session.commit()
        await self.session.refresh(project)
        return project



    async def delete(self, project: Project) -> None:
        await self.session.delete(project)
        await self.session.commit()

    async def is_archived(self, project_id: int) -> bool:
        stmt = (
            select(Project.status)
            .where(Project.id == project_id)
        )
        result = await self.session.execute(stmt)
        status = result.scalar_one_or_none()

        return (status in
                [ProjectStatus.ARCHIVED_BY_USER, ProjectStatus.ARCHIVED_BY_CASCADE])

    async def get_all_with_stats(
            self,
            *,
            owner_id: int | None = None,
            statuses: list[ProjectStatus] | None = None,
            sort_by: SortType = SortType.CREATED_AT,
            search: str | None = None,
            offset: int = 0,
            limit: int = 10,
    ):
        stmt = (
            select(
                Project,
                func.count(Task.id).label("total_tasks"),
                func.count(
                    case((Task.status == TaskStatus.DONE, 1))
                ).label("completed_tasks"),
            )
            .outerjoin(TaskList, TaskList.project_id == Project.id)
            .outerjoin(Task, Task.task_list_id == TaskList.id)
            .group_by(Project.id)
        )

        # ===== OWNER =====
        if owner_id is not None:
            stmt = stmt.where(Project.owner_id == owner_id)

        # ===== СТАТУСЫ =====
        if statuses is not None:
            stmt = stmt.where(Project.status.in_(statuses))
        else:
            stmt = stmt.where(
                Project.status.in_([TaskListStatus.ACTIVE]))

        # ===== ПОИСК =====
        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Project.title.ilike(search_pattern),
                    Project.description.ilike(search_pattern),
                )
            )

        # ===== СОРТИРОВКА =====
        if sort_by == SortType.CREATED_AT:
            stmt = stmt.order_by(Project.created_at.desc())
        elif sort_by == SortType.TITLE:
            stmt = stmt.order_by(Project.title.asc())
        elif sort_by == SortType.UPDATE_AT:
            stmt = stmt.order_by(Project.updated_at.desc())

        # ===== ПАГИНАЦИЯ =====
        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        return result.all()

    async def count_all(
            self,
            *,
            owner_id: int | None = None,
            statuses: list[ProjectStatus] | None = None,
            search: str | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(Project)

        if owner_id is not None:
            stmt = stmt.where(Project.owner_id == owner_id)

        if statuses is not None:
            stmt = stmt.where(Project.status.in_(statuses))
        else:
            stmt = stmt.where(
                Project.status.in_([ProjectStatus.ACTIVE]))

        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Project.title.ilike(search_pattern),
                    Project.description.ilike(search_pattern),
                )
            )

        result = await self.session.execute(stmt)
        return result.scalar_one()