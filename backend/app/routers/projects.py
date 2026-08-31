# app\routers\projects.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.user import User
from app.models.project import ProjectRead, ProjectCreate, ProjectUpdate
from app.services.project_service import ProjectService, get_project_service
from app.models.enums import ProjectStatus, SortType, OrderType
from fastapi import Query
from app.models.base import Page

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
        data: ProjectCreate,
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    return await service.create(owner_id=current_user.id, data=data)



@router.get(
    "",
    response_model=Page[ProjectRead],
    summary="Получить список не архивных проектов с поиском и фильтрацией",
    description=(
            "Возвращает список проектов с возможностью поиска и фильтрации.\n\n"
            "**Сортировка:**\n"
            "- `sort_by=created_at` - По дате создания (новые первые)(по умолчанию)\n"
            "- `sort_by=updated_at` - По дате изменения (активные первые)\n"
            "- `sort_by=title` - По названию\n"
            "- `order` - Порядок сортировки (asc, desc)\n\n"
            ""

            "**Параметры:**\n"
            "- `search` - Поиск по названию или описанию\n"
            "- `statuses` - Фильтр по статусу (active, archived_by_user, archived_by_cascade)\n\n"
            "**Примеры:**\n"
            "- `GET /projects/?search=моя` - Найти проекты с \"моя\" в названии\n"
            "- `GET /projects/?statuses=archived_by_user&statuses=archived_by_cascade` - Только архивные"
    ),
)
async def get_projects(
        page: int = Query(1, ge=1),
        count: int = Query(9, ge=1),
        search: str | None = Query(default=None, description="Поиск по названию или описанию"),
        statuses: list[ProjectStatus] | None = Query(default=None, description="Фильтр по статусу"),
        sort_by: SortType = Query(default=SortType.CREATED_AT, description="Способ сортировки"),
        order: OrderType = Query(default=OrderType.DESC, description="Порядок сортировки"),
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    return await service.get_projects_paginated(
        owner_id=current_user.id,
        sort_by=sort_by,
        order=order,
        search=search,
        statuses=statuses,
        page=page,
        count=count
    )

@router.get(
    "/{project_id}",
    response_model=ProjectRead,
    summary="Получение проекта по id",
    description="Возвращает проект, принадлежащий текущему пользователю.",
)
async def get_project(
        project_id: int,
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    return await service.get_by_id_with_stats(
        project_id=project_id,
        owner_id=current_user.id
    )


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
        project_id: int,
        data: ProjectUpdate,
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    project = await service.get_by_id(project_id=project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return await service.update(project=project, owner_id=current_user.id, data=data)



@router.patch(
    "/{project_id}/archive",
    response_model=ProjectRead,
    summary="Архивировать проект каскадно со всеми дочками"
)
async def archive_project(
        project_id: int,
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    project = await service.get_by_id(
        project_id=project_id,
        owner_id=current_user.id,
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status in (
            ProjectStatus.ARCHIVED_BY_USER,
            ProjectStatus.ARCHIVED_BY_CASCADE,
    ):
        raise HTTPException(
            status_code=400,
            detail="Project already archived",
        )

    return await service.archive(
        project=project,
        owner_id=current_user.id,
    )


@router.patch(
    "/{project_id}/unarchive",
    response_model=ProjectRead,
    summary="Разархивировать проект каскадно со всеми дочками"
)
async def unarchive_project(
        project_id: int,
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    project = await service.get_by_id(
        project_id=project_id,
        owner_id=current_user.id,
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status not in (
            ProjectStatus.ARCHIVED_BY_USER,
            ProjectStatus.ARCHIVED_BY_CASCADE,
    ):
        raise HTTPException(
            status_code=400,
            detail="Project is not archived",
        )

    return await service.unarchive(
        project=project,
        owner_id=current_user.id,
    )


@router.delete("/{project_id}", status_code=204, summary="Удаление только архивного проекта каскадно со всеми дочками")
async def delete_project(
        project_id: int,
        current_user: User = Depends(get_current_user),
        service: ProjectService = Depends(get_project_service),
):
    await service.delete(project_id=project_id, owner_id=current_user.id)
