from datetime import datetime, timezone
from typing import List

from app.core.exceptions.reminder import (ReminderArchivedTaskError, ReminderCompleteTaskError,
    ReminderCountError, ReminderDuplicateError, ReminderFutureError,
    ReminderPendingError, ReminderTaskAlreadyDoneError, 
    ReminderTaskNotFoundError, ReminderNotFoundError)
from app.models import Task, TaskStatus
from app.models.enums import ReminderStatus
from app.models.reminder import (ReminderCreate, Reminder, ReminderResponse, 
                                 ReminderUpdate, ReminderWithTaskResponse)
from app.repositories.reminder_repo import ReminderRepository
from app.repositories.task_repo import TaskRepository
from app.utils.response_builders import build_task_response


class ReminderService:
    def __init__(
            self,
            remind_repo: ReminderRepository,
            task_repo: TaskRepository,
    ) -> None:
        self.remind_repo = remind_repo
        self.task_repo = task_repo

    async def _get_task_with_aggregates(
            self,
            task_id: int,
            user_id: int
    ) -> Task:
        row = await self.task_repo.get_by_id(
            task_id,
            user_id
        ) # type: ignore
        if not row:
            raise ReminderTaskNotFoundError()
        return row[0]

    async def _build_reminder_task_response(
            self, 
            reminder: Reminder, 
            user_id: int
            ) -> ReminderWithTaskResponse:
        
        task_row = await self.task_repo.get_by_id(reminder.task_id, user_id) # pyright: ignore[reportArgumentType]
        if not task_row:
            raise ReminderTaskNotFoundError()
        
        task_obj, ts, cs, ta, tr = task_row
        task_resp = build_task_response(task_obj, ts, cs, ta, tr)

        reminder_resp = ReminderResponse.model_validate(reminder)
        return ReminderWithTaskResponse(
            reminder=reminder_resp,
            task=task_resp
        ) # type: ignore
    

    async def create_reminder(
            self,
            task_id: int,
            reminder: ReminderCreate,
            user_id: int
    ) -> ReminderWithTaskResponse:
        if reminder.reminder_at <= datetime.now(timezone.utc):
            raise ReminderFutureError()

        task: Task = await self._get_task_with_aggregates(
            task_id,
            user_id
        )

        if task.status == TaskStatus.DONE:
            raise ReminderCompleteTaskError()
        
        if task.is_archived:
            raise ReminderArchivedTaskError()

        existing = await self.remind_repo.get_by_task_and_time(task_id, reminder.reminder_at)
        if existing:
            raise ReminderDuplicateError()

        count: int = await self.remind_repo.get_count_pending_reminders(task_id)
        if count >= 5:
            raise ReminderCountError()

        reminder_data = reminder.model_dump()
        db_reminder = Reminder(
            **reminder_data,
            task_id=task_id,
        )
        db_reminder = await self.remind_repo.create(db_reminder)
    
        return await self._build_reminder_task_response(db_reminder, user_id)

    async def get_reminder_by_id(
            self,
            reminder_id: int,
            user_id: int
    ) -> ReminderResponse:
        reminder: Reminder = await self.remind_repo.get_by_id(
            reminder_id,
            user_id
        ) # type: ignore
        if not reminder:
            raise ReminderNotFoundError()

        reminder_response: ReminderResponse = ReminderResponse.model_validate(reminder)

        return reminder_response

    async def get_reminders_by_task_id(
            self,
            task_id: int,
            user_id: int
    ) -> List[ReminderResponse]:
        _: Task = await self._get_task_with_aggregates(
            task_id,
            user_id
        )

        reminders: List[Reminder] = await self.remind_repo.get_by_task(
            task_id
        )

        reminders_response: List[ReminderResponse] = [
            ReminderResponse.model_validate(reminder)
            for reminder in reminders
        ]

        return reminders_response

    async def update_reminder(
            self,
            reminder: ReminderUpdate,
            reminder_id: int,
            user_id: int
    ) -> ReminderWithTaskResponse:
        if reminder.reminder_at <= datetime.now(timezone.utc): # type: ignore
            raise ReminderFutureError()

        reminder_db: Reminder = await self.remind_repo.get_by_id(
            reminder_id,
            user_id
        ) # type: ignore
        if not reminder_db:
            raise ReminderNotFoundError()
        if reminder_db.status != ReminderStatus.PENDING:
            raise ReminderPendingError()

        task_id = reminder_db.task_id
        if reminder.task_id is not None and reminder.task_id != reminder_db.task_id:
            task_id = reminder.task_id
            
        task: Task = await self._get_task_with_aggregates(
            task_id,
            user_id
        )
        if task.is_archived:
            raise ReminderArchivedTaskError()
        if task.status == TaskStatus.DONE:
            raise ReminderTaskAlreadyDoneError()

        if reminder.task_id is not None and reminder.task_id != reminder_db.task_id:
            count = await self.remind_repo.get_count_pending_reminders(task_id)
            if count >= 5:
                raise ReminderCountError()

        if reminder.reminder_at is not None:
            existing = await self.remind_repo.get_by_task_and_time(
                task_id, reminder.reminder_at
            )
            if existing and existing.id != reminder_id:
                raise ReminderDuplicateError()


        updated_data = reminder.model_dump(exclude_unset=True)

        for field, value in updated_data.items():
            setattr(reminder_db, field, value)

        updated_reminder = await self.remind_repo.update(reminder_db)
        return await self._build_reminder_task_response(updated_reminder, user_id)

    async def delete_reminder(
            self,
            reminder_id: int,
            user_id: int
    ) -> ReminderWithTaskResponse:
        reminder_db: Reminder = await self.remind_repo.get_by_id(
            reminder_id,
            user_id
        ) # type: ignore
        if not reminder_db:
            raise ReminderNotFoundError()
        
        await self.remind_repo.delete(reminder_db)

        return await self._build_reminder_task_response(reminder_db, user_id)
