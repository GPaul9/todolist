from typing import List

from fastapi import APIRouter, Depends, Query, status, HTTPException

from app.dependencies import get_current_user, get_subtask_service
from app.models.subtask import SubTask, SubTaskResponse, SubTaskCreate, \
    SubTaskUpdate, SubTaskWithTaskResponse
from app.models.user import User
from app.services.subtask_service import SubTaskService

router = APIRouter(tags=["subtasks"])


@router.post("/tasks/{task_id}/subtasks",
             response_model=SubTaskWithTaskResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Create a new subtask"
             )
async def create_subtask(
        task_id: int,
        subtask_create: SubTaskCreate,
        current_user: User = Depends(get_current_user),
        service: SubTaskService = Depends(get_subtask_service)
) -> SubTaskWithTaskResponse:
    return await service.create_subtask(
        task_id=task_id,
        subtask=subtask_create,
        current_user=current_user
    )


@router.get("/tasks/{task_id}/subtasks",
            response_model=List[SubTaskResponse],
            summary="List all subtasks"
            )
async def get_subtasks(
        task_id: int,
        offset: int = Query(1, ge=1),
        limit: int = Query(50, ge=1, le=100),
        current_user: User = Depends(get_current_user),
        service: SubTaskService = Depends(get_subtask_service)
) -> List[SubTaskResponse]:
    return await service.get_subtasks_by_task_id(
        task_id=task_id,
        current_user=current_user,
        offset=offset,
        limit=limit,
    ) # type: ignore


@router.patch("/subtasks/{subtask_id}",
              response_model=SubTaskWithTaskResponse,
              summary="Update a subtask"
              )
async def update_subtask(
        subtask: SubTaskUpdate,
        subtask_id: int,
        current_user: User = Depends(get_current_user),
        service: SubTaskService = Depends(get_subtask_service)
) -> SubTask:
    return await service.update_subtask(
        subtask_id=subtask_id,
        subtask=subtask,
        current_user=current_user
    ) # type: ignore


@router.delete("/subtasks/{subtask_id}",
               status_code=status.HTTP_200_OK,
               summary="Delete a subtask",
               response_model=SubTaskWithTaskResponse
               )
async def delete_subtask(
        subtask_id: int,
        current_user: User = Depends(get_current_user),
        service: SubTaskService = Depends(get_subtask_service)
) -> SubTaskWithTaskResponse:
    return await service.delete(
        subtask_id=subtask_id,
        current_user=current_user
    )
