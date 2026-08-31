from typing import Sequence

from sqlalchemy import func, update, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project
from app.models.list import TaskList
from app.models.task import Task
from app.models.enums import TaskListStatus, SortType, ListSortType


class TaskListRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, list_id: int) -> TaskList | None:
        stmt = select(TaskList).where(TaskList.id == list_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project(self,
                             project_id: int,
                             status: list[TaskListStatus] | None = None,
                             *,
                             sort_by: ListSortType = ListSortType.ORDER,
                             offset: int = 0,
                             limit: int = 10,
                             ) -> list[TaskList]:

        stmt = (select(TaskList).where(TaskList.project_id == project_id))

        if status is not None:
            # Явно указанные статусы
            stmt = stmt.where(TaskList.status.in_(status))
        else:
            # Дефолт: только активные
            stmt = stmt.where(
                TaskList.status.in_([TaskListStatus.ACTIVE]))

        # ===== ПАГИНАЦИЯ =====
        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_next_order(self, project_id: int) -> int:
        stmt = (
            select(func.coalesce(func.max(TaskList.order), 0))
            .where(TaskList.project_id == project_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one() + 1

    async def create(
            self,
            *,
            project_id: int,
            title: str,
            order: int,
    ) -> TaskList:
        task_list = TaskList(
            title=title,
            project_id=project_id,
            order=order,
        )
        self.session.add(task_list)

        await self.session.commit()
        await self.session.refresh(task_list)
        return task_list

    async def update(self, task_list: TaskList, **fields) -> TaskList:
        for field, value in fields.items():
            setattr(task_list, field, value)

        await self.session.commit()
        await self.session.refresh(task_list)
        return task_list



    # ---------- TASKS ----------

    async def get_tasks(self, list_id: int) -> Sequence[Task]:
        stmt = (
            select(Task)
            .where(Task.task_list_id == list_id)
            .order_by(Task.position)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def delete(self, task_list: TaskList) -> None:
        await self.session.delete(task_list)
        await self.session.commit()

    async def get_all(
            self,
            *,
            project_id: int,
            owner_id: int,
            statuses: list[TaskListStatus] | None = None,
            offset: int = 0,
            limit: int = 10,
    ) -> list[TaskList]:

        stmt = (
            select(TaskList)
            .join(Project, TaskList.project_id == Project.id)  # ← КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
            .where(TaskList.project_id == project_id)
        )

        # ===== OWNER =====
        stmt = stmt.where(Project.owner_id == owner_id)

        # ===== СТАТУСЫ =====
        if statuses is not None:
            stmt = stmt.where(TaskList.status.in_(statuses))
        else:
            stmt = stmt.where(TaskList.status.in_([TaskListStatus.ACTIVE]))

        # ===== СОРТИРОВКА списка задач по умолчанию от большего к меньшему  =====
        stmt = stmt.order_by(TaskList.order.desc())

        # ===== ПАГИНАЦИЯ =====
        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_all_by_user(
            self,
            *,
            owner_id: int,
            statuses: list[TaskListStatus] | None = None,
            offset: int = 0,
            limit: int = 10,
    ) -> list[TaskList]:

        stmt = (
            select(TaskList)
            .join(Project, TaskList.project_id == Project.id)  # ← КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
        )

        # ===== OWNER =====
        stmt = stmt.where(Project.owner_id == owner_id)

        # ===== СТАТУСЫ =====
        if statuses is not None:
            stmt = stmt.where(TaskList.status.in_(statuses))
        else:
            stmt = stmt.where(TaskList.status.in_([TaskListStatus.ARCHIVED_BY_USER,]))

        # ===== СОРТИРОВКА списка задач по умолчанию =====
        stmt = stmt.order_by(TaskList.order.desc())

        # ===== ПАГИНАЦИЯ =====
        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        return result.scalars().all()


    async def count_all(
            self,
            *,
            project_id: int,
            owner_id: int,
            statuses: list[TaskListStatus] | None = None,

    ) -> int:
        stmt = (
            select(func.count(TaskList.id))
            .join(Project, TaskList.project_id == Project.id)
            .where(TaskList.project_id == project_id)
        )

        stmt = stmt.where(Project.owner_id == owner_id)

        if statuses is not None:
            stmt = stmt.where(TaskList.status.in_(statuses))
        else:
            stmt = stmt.where(TaskList.status.in_([TaskListStatus.ACTIVE]))

        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def count_all_by_user(
            self,
            *,
            owner_id: int,
            statuses: list[TaskListStatus] | None = None,

    ) -> int:
        stmt = (
            select(func.count(TaskList.id))
            .join(Project, TaskList.project_id == Project.id)
        )

        stmt = stmt.where(Project.owner_id == owner_id)

        if statuses is not None:
            stmt = stmt.where(TaskList.status.in_(statuses))
        else:
            stmt = stmt.where(TaskList.status.in_([TaskListStatus.ARCHIVED_BY_USER,]))

        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def reorder_lists(
            self,
            *,
            project_id: int,
            ordered_ids: list[int],
    ) -> None:

        for index, list_id in enumerate(ordered_ids):
            stmt = (
                update(TaskList)
                .where(
                    TaskList.id == list_id,
                    TaskList.project_id == project_id,
                )
                .values(order=index)
            )
            await self.session.execute(stmt)

        await self.session.commit()


    async def archive_list(self, project_id: int) -> None:
        stmt_active = (
            update(TaskList)
            .where(
                TaskList.project_id == project_id,
                TaskList.status == TaskListStatus.ACTIVE,
            )
            .values(status=TaskListStatus.ARCHIVED_BY_CASCADE)
        )

        stmt_user_archived = (
            update(TaskList)
            .where(
                TaskList.project_id == project_id,
                TaskList.status == TaskListStatus.ARCHIVED_BY_USER,
            )
            .values(status=TaskListStatus.ARCHIVED_BY_USER_AND_CASCADE)
        )

        await self.session.execute(stmt_active)
        await self.session.execute(stmt_user_archived)
        await self.session.commit()

    async def unarchive_list(self, project_id: int) -> None:
        stmt_active = (
            update(TaskList)
            .where(
                TaskList.project_id == project_id,
                TaskList.status == TaskListStatus.ARCHIVED_BY_CASCADE,
            )
            .values(status=TaskListStatus.ACTIVE)
        )

        stmt_user_archived = (
            update(TaskList)
            .where(
                TaskList.project_id == project_id,
                TaskList.status == TaskListStatus.ARCHIVED_BY_USER_AND_CASCADE,
            )
            .values(status=TaskListStatus.ARCHIVED_BY_USER)
        )

        await self.session.execute(stmt_active)
        await self.session.execute(stmt_user_archived)
        await self.session.commit()