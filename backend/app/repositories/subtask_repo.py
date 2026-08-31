from datetime import timezone, datetime
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select, update

from app.models import Task, TaskList, Project
from app.models.subtask import SubTask


class SubTaskRepository:
    """Асинхронный репозиторий для работы с подзадачами"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_next_position(self, task_id: int) -> int:
        """Получение следующей позиции для подзадачи"""
        stmt = (
            select(func.coalesce(func.max(SubTask.position), 0))
            .where(SubTask.task_id == task_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one() + 1

    async def create(self, subtask: SubTask) -> SubTask:
        """Создание новой подзадачи"""
        self.session.add(subtask)
        await self.session.commit()
        await self.session.refresh(subtask)
        return subtask

    async def get_by_id(self, subtask_id: int, user_id: int) -> Optional[SubTask]:
        """Получение подзадачи по ID"""
        stmt = (
            select(SubTask)
            .join(Task)
            .join(TaskList)
            .join(Project)
            .where(
                SubTask.id == subtask_id,
                Project.owner_id == user_id
            )
            .options(
                selectinload(SubTask.task)  # type: ignore
            )
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, subtask: SubTask) -> SubTask:
        """Сохранение изменений, в частности удаление/перенос в архив"""
        self.session.add(subtask)
        await self.session.commit()
        await self.session.refresh(subtask)
        return subtask

    async def get_by_task_id(self,
                             task_id: int,
                             offset: int = 0,
                             limit: int = 50
                             ) -> List[SubTask]:
        """Получение подзадач по id задачи"""
        stmt = (
            select(SubTask)
            .where(
                SubTask.task_id == task_id,
                # SubTask.is_archived == False
            )
            .order_by(SubTask.position)  # type: ignore[arg-type]
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        subtasks = result.scalars().all()
        return list(subtasks)

    async def delete(self, db_subtask) -> None:
        """Удаление подзадачи"""
        await self.session.delete(db_subtask)
        await self.session.commit()

    async def archive_by_project(self, project_id: int) -> None:
        """Каскадная архивация подзадачи при архивировании проекта"""
        stmt = (
            update(SubTask)
            .where(
                SubTask.task_id.in_(  # type: ignore
                    select(Task.id)
                    .where(
                        Task.task_list_id.in_(  # type: ignore
                            select(TaskList.id)
                            .where(TaskList.project_id == project_id)
                        )
                    )
                )
            )
            .values(
                is_archived=True,
                archived_at=datetime.now(timezone.utc)
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def unarchive_by_project(self, project_id: int) -> None:
        """Каскадная разархивация подзадачи при разархивировании проекта"""
        stmt = (
            update(SubTask)
            .where(
                SubTask.task_id.in_(  # type: ignore
                    select(Task.id)
                    .where(
                        Task.task_list_id.in_(  # type: ignore
                            select(TaskList.id)
                            .where(TaskList.project_id == project_id)
                        )
                    )
                )
            )
            .values(
                is_archived=False,
                archived_at=None
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def archive_by_list(self, list_id: int) -> None:
        """Каскадная архивация подзадачи при архивировании списка задач"""
        stmt = (
            update(SubTask)
            .where(
                SubTask.task_id.in_(  # type: ignore
                    select(Task.id)
                    .where(Task.task_list_id == list_id)
                )
            )
            .values(
                is_archived=True,
                archived_at=datetime.now(timezone.utc)
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def unarchive_by_list(self, list_id: int) -> None:
        """Каскадная разархивация подзадачи при разархивировании списка задач"""
        stmt = (
            update(SubTask)
            .where(
                SubTask.task_id.in_(  # type: ignore
                    select(Task.id)
                    .where(Task.task_list_id == list_id)
                )
            )
            .values(
                is_archived=False,
                archived_at=None
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()
