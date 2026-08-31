from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select, update

from app.models import Reminder, Task, TaskList, Project
from app.models.enums import ReminderStatus


class ReminderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
            self,
            reminder: Reminder
    ) -> Reminder:
        """Создание нового напоминания"""
        self.session.add(reminder)
        await self.session.commit()
        await self.session.refresh(reminder)
        return reminder

    async def get_by_id(
            self, 
            reminder_id: int, 
            user_id: int
            ) -> Optional[Reminder]:
        """Получение напоминания по ID с проверкой принадлежности пользователю"""
        stmt = (
            select(Reminder)
            .join(Task)
            .join(TaskList)
            .join(Project)
            .where(
                Reminder.id == reminder_id,
                Project.owner_id == user_id
            )
            .options(
                selectinload(Reminder.task) # type: ignore
            )
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_task(self, task_id: int) -> List[Reminder]:
        """Получение всех напоминаний для задачи"""
        stmt = select(Reminder).where(Reminder.task_id == task_id)

        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    async def update(self, reminder: Reminder) -> Reminder:
        """Обновление существующего напоминания"""
        self.session.add(reminder)
        await self.session.commit()
        await self.session.refresh(reminder)
        return reminder

    async def delete(self, reminder: Reminder) -> None:
        await self.session.delete(reminder)
        await self.session.commit()

    async def get_count_pending_reminders(self, task_id: int) -> int:
        """Получение количества ожидающих напоминаний для задачи"""
        stmt = (
            select(func.count(Reminder.id)) # type: ignore
            .where(
                Reminder.task_id == task_id,
                Reminder.status == ReminderStatus.PENDING
            )
        )
        result = await self.session.execute(stmt)
        count = result.scalar_one_or_none()
        return count or 0

    async def get_pending_to_send(
            self,
            now: Optional[datetime] = None
    ) -> List[Reminder]:
        """Получение напоминаниц, готовых к отправке"""
        now = now or datetime.now(timezone.utc)
        stmt = (
            select(Reminder)
            .where(
                Reminder.status == ReminderStatus.PENDING,
                Reminder.reminder_at <= now
            )
            .options(selectinload(Reminder.task)) # type: ignore
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def set_processing_if_pending(self, reminder_id: int) -> bool:
        """Перевод напоминания в статус PROCESSING, если оно PENDING"""
        stmt = (
            update(Reminder)
            .where(
                Reminder.id == reminder_id, # type: ignore
                Reminder.status == ReminderStatus.PENDING # type: ignore
            )
            .values(status=ReminderStatus.PROCESSING)
        )

        result = await self.session.execute(stmt)
        await self.session.commit()

        return result.rowcount == 1 # type: ignore

    async def get_by_id_for_worker(self, reminder_id: int) -> Optional[Reminder]:
        """Получение напоминания с полной цепочкой связей для воркера"""
        stmt = (
            select(Reminder)
            .where(
                Reminder.id == reminder_id
            )
            .options(
                selectinload(Reminder.task) # type: ignore
                .selectinload(Task.task_list) # type: ignore
                .selectinload(TaskList.project) # type: ignore
                .selectinload(Project.owner) # type: ignore
            )
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_task_and_time(self, task_id:int, reminder_at: datetime) -> Optional[Reminder]:
        stmt = (
            select(Reminder)
                .where(
                    Reminder.task_id == task_id,
                    Reminder.reminder_at == reminder_at,
                    Reminder.status == ReminderStatus.PENDING
                )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()