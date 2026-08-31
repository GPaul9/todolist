from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import User
from app.models.list import TaskListCreate, TaskListUpdate, TaskListRead, TaskListReorder
from app.services.list_service import TaskListService, get_tasklist_service
from app.dependencies import get_current_user
from app.models.enums import TaskListStatus
from fastapi import Query
from app.models.base import Page

router = APIRouter(prefix="/lists", tags=["lists"])


@router.post(
    "/project/{project_id}",
    response_model=TaskListRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_task_list(
        project_id: int,
        data: TaskListCreate,
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    return await service.create(project_id=project_id, owner_id=current_user.id, data=data)


@router.get(
    "/project/{project_id}",
    response_model=Page[TaskListRead],
    summary="Все списки задач проекта по id проекта с пагинацией",
    description=(
            "Возвращает список всех неархивированных списков задач, принадлежащих текущему пользователю по id проекта."
            "По умолчаннию стоит фильтр по активным спискам (statuses=active)\n\n"

            "**Фильтрация по статусу:**\n"
            "- `statuses=archived_by_user` - Списки, архивированные пользователем\n"
            "- `statuses=archived_by_cascade` - Списки, архивированные каскадом\n"
            "- `statuses=archived_by_user&statuses=archived_by_cascade` - Все архивные списки\n"
    ),
)
async def get_lists_by_project(
        project_id: int,
        page: int = Query(1, ge=1),
        count: int = Query(9, ge=1),
        statuses: list[TaskListStatus] | None = Query(default=None, description="Фильтр по статусу"),
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    return await service.get_lists_paginated(project_id=project_id, owner_id=current_user.id, statuses=statuses,
                                             page=page, count=count)

@router.get(
    "/all/",
    response_model=Page[TaskListRead],
    summary="Все списки задач пользователя с пагинацией",
    description=(
            "Возвращает список всех списков задач, принадлежащих текущему пользователю."
            "По умолчаннию стоит фильтр по архивным спискам (statuses=archived_by_user&statuses=archived_by_cascade)\n\n"

            "**Фильтрация по статусу:**\n"
            "- `statuses=archived_by_user` - Только списки, архивированные пользователем\n"
            "- `statuses=archived_by_cascade` - Только списки, архивированные каскадом\n"
            "- `statuses=active` - Только все активные списки\n"
    ),
)
async def get_lists_by_user(
        page: int = Query(1, ge=1),
        count: int = Query(9, ge=1),
        statuses: list[TaskListStatus] | None = Query(default=None, description="Фильтр по статусу"),
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    return await service.get_lists_by_user(owner_id=current_user.id, statuses=statuses,
                                             page=page, count=count)


@router.patch("/{list_id}", response_model=TaskListRead)
async def update_task_list(
        list_id: int,
        data: TaskListUpdate,
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    task_list = await service.get_by_id(list_id=list_id, owner_id=current_user.id)
    if not task_list:
        raise HTTPException(status_code=404, detail="Task list not found")

    return await service.update(task_list=task_list, owner_id=current_user.id, data=data)


@router.post("/reorder", status_code=204)
async def reorder_task_lists(
        data: TaskListReorder,
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    await service.reorder_lists(
        owner_id=current_user.id,
        project_id=data.project_id,
        ordered_ids=data.ordered_ids,
    )


# ---------- ARCHIVE / UNARCHIVE ----------

@router.patch(
    "/{list_id}/archive",
    response_model=TaskListRead,
    summary="Архивировать список задач каскадно со всеми дочками"
)
async def archive_task_list(
        list_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    task_list = await service.get_by_id(
        list_id=list_id,
        owner_id=current_user.id,
    )
    if not task_list:
        raise HTTPException(status_code=404, detail="Task list not found")

    if task_list.status in (
            TaskListStatus.ARCHIVED_BY_USER,
            TaskListStatus.ARCHIVED_BY_CASCADE,
            TaskListStatus.ARCHIVED_BY_USER_AND_CASCADE,

    ):
        raise HTTPException(
            status_code=400,
            detail="Task list already archived",
        )

    return await service.archive(
        task_list=task_list,
        owner_id=current_user.id,
    )


@router.patch(
    "/{list_id}/unarchive",
    response_model=TaskListRead,
    summary="Разархивировать список задач каскадно со всеми дочками"
)
async def unarchive_task_list(
        list_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    task_list = await service.get_by_id(
        list_id=list_id,
        owner_id=current_user.id,
    )
    if not task_list:
        raise HTTPException(status_code=404, detail="Task list not found")

    if task_list.status not in (
            TaskListStatus.ARCHIVED_BY_USER,
            TaskListStatus.ARCHIVED_BY_CASCADE,
            TaskListStatus.ARCHIVED_BY_USER_AND_CASCADE,
    ):
        raise HTTPException(
            status_code=400,
            detail="Task list is not archived",
        )

    return await service.unarchive(
        task_list=task_list,
        owner_id=current_user.id,
    )


@router.delete("/{list_id}", status_code=204, summary="Удаление только архивного списка каскадно со всеми дочками")
async def delete_task_list(
        list_id: int,
        current_user: User = Depends(get_current_user),
        service: TaskListService = Depends(get_tasklist_service),
):
    await service.delete(list_id=list_id, owner_id=current_user.id)
