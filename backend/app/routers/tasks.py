from typing import List
from fastapi import APIRouter, status, Depends

from app.dependencies import get_current_user, get_task_filters, get_task_service
from app.models.task import TaskCreate, TaskUpdate, \
    TaskResponse, TaskSearchParams, TaskReorder
from app.models.user import User
from app.services.task_service import TaskService
from app.models.base import Page

router = APIRouter(tags=["tasks"])


@router.post("/lists/{list_id}/tasks",
             response_model=TaskResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Создать задачу в списке",
             description="Создаёт задачу в указанном списке. "
                         "Нельзя создавать задачи в архивном проекте."
             )
async def create_task(
        list_id: int,
        task_create: TaskCreate,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    return await service.create_task(
        list_id=list_id,
        task=task_create,
        current_user=current_user
    )


@router.get("/lists/{list_id}/tasks",
            response_model=Page[TaskResponse],
            summary="Задачи списка с пагинацией",
            description="Возвращает задачи конкретного списка постранично. "
                        "По умолчанию — активные задачи."
            )
async def get_tasks_by_list(
        list_id: int,
        filters: TaskSearchParams = Depends(get_task_filters),
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> Page[TaskResponse]:
    return await service.get_tasks_by_list_id(
        list_id=list_id,
        filters=filters,
        current_user=current_user,
    )


@router.get("/tasks/{task_id}",
            response_model=TaskResponse,
            summary="Получить задачу по её id",
            description="Возвращает полную информацию о задаче: "
                        "подзадачи, теги, вложения, напоминания."
            )
async def read_task(
        task_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    return await service.get_task_by_id(task_id, current_user)


@router.get(
    "/tasks",
    response_model=Page[TaskResponse],
    summary="Поиск и фильтрация",
    description="Поиск по названию и описанию. "
                "Фильтрация по статусу, приоритету, тегам, дате. "
                "Сортировка по дате или алфавиту."
)
async def search_tasks(
        filters: TaskSearchParams = Depends(get_task_filters),
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> Page[TaskResponse]:
    return await service.search_task(
        filters=filters,
        current_user=current_user
    )


@router.patch("/tasks/{task_id}",
              response_model=TaskResponse,
              summary="Обновить задачу по её ID"
              )
async def update_task(
        task: TaskUpdate,
        task_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    return await service.update_task(task, task_id, current_user)


@router.patch("/tasks/{task_id}/reorder",
              response_model=TaskResponse,
              summary="Переместить задачу (drag & drop)"
              )
async def reorder_task(
        task_id: int,
        reorder_data: TaskReorder,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
):
    return await service.reorder_task(
        task_id,
        reorder_data,
        current_user
    )


@router.delete("/tasks/{task_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Мягкое удаление задачи по её ID"
               )
async def delete_task(
        task_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> None:
    await service.delete_task(task_id, current_user)


# ======TAG=====

@router.post(
    "/tasks/{task_id}/tags/{tag_id}",
    status_code=201,
    summary="Добавить тег к задаче",
    description="Максимум 25 тегов на задачу.",
    response_model=TaskResponse
)
async def add_tag(
        task_id: int,
        tag_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    return await service.add_tag_to_task(task_id, tag_id, current_user)


@router.delete(
    "/tasks/{task_id}/tags/{tag_id}",
    status_code=status.HTTP_200_OK,
    summary="Удалить тег с задачи",
    response_model=TaskResponse
)
async def delete_tag_from_task(
        task_id: int,
        tag_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Отвязывание тега от задачи"""
    return await service.remove_tag_from_task(
        task_id, tag_id, current_user
    )
