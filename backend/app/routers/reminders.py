from typing import List

from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user, get_reminder_service
from app.models import User
from app.models.reminder import ReminderResponse, ReminderCreate, \
    ReminderUpdate, ReminderWithTaskResponse
from app.services.reminder_service import ReminderService

router = APIRouter(tags=["reminders"])


@router.post("/tasks/{task_id}/reminders", 
             response_model=ReminderWithTaskResponse)
async def add_reminder(
        task_id: int,
        reminder: ReminderCreate,
        current_user: User = Depends(get_current_user),
        service: ReminderService = Depends(get_reminder_service)
) -> ReminderWithTaskResponse:
    return await service.create_reminder(task_id, reminder, current_user.id) # type: ignore
    

@router.get(
    "/tasks/{task_id}/reminders",
    response_model=List[ReminderResponse]
)
async def get_reminders(
        task_id: int,
        current_user: User = Depends(get_current_user),
        service: ReminderService = Depends(get_reminder_service)
) -> List[ReminderResponse]:
    return await service.get_reminders_by_task_id(task_id, current_user.id) # type: ignore


@router.patch(
    "/reminders/{reminder_id}",
    response_model=ReminderWithTaskResponse
)
async def update_remind(
        reminder: ReminderUpdate,
        reminder_id: int,
        current_user: User = Depends(get_current_user),
        service: ReminderService = Depends(get_reminder_service)
) -> ReminderWithTaskResponse:
    return await service.update_reminder(
            reminder,
            reminder_id,
            current_user.id # type: ignore
        )
   

@router.delete(
    "/reminders/{reminder_id}",
    status_code=status.HTTP_200_OK,
    response_model=ReminderWithTaskResponse
)
async def delete_reminder(
        reminder_id: int,
        current_user: User = Depends(get_current_user),
        service: ReminderService = Depends(get_reminder_service)
) -> ReminderWithTaskResponse:
        return await service.delete_reminder(reminder_id, current_user.id) # type: ignore

