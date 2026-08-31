import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI, status
from httpx import AsyncClient, ASGITransport

# Импорты из вашего проекта
from app.routers.projects import router
from app.models.user import User
from app.models.project import ProjectRead  # <--- ВАЖНО: импортируем модель ответа
from app.models.enums import ProjectStatus, SortType, OrderType
from app.dependencies import get_current_user
from app.services.project_service import get_project_service


# -----------------------------------------------------------------------------
# Вспомогательная функция для создания валидного тестового проекта
# -----------------------------------------------------------------------------
def make_project_read(id: int, title: str = "Test Project", status: ProjectStatus = ProjectStatus.ACTIVE, **kwargs):
    """Создаёт валидный экземпляр ProjectRead для тестов."""
    from datetime import datetime, timezone
    return ProjectRead(
        id=id,
        title=title,
        description=kwargs.get("description", "Test description"),
        status=status,
        owner_id=kwargs.get("owner_id", 1), # type: ignore
        created_at=kwargs.get("created_at", datetime.now(timezone.utc)),
        updated_at=kwargs.get("updated_at", datetime.now(timezone.utc)), # type: ignore
        **{k: v for k, v in kwargs.items() if k not in [
            "description", "owner_id", "created_at", "updated_at"
        ]}
    )


# -----------------------------------------------------------------------------
# Исправленные тесты
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_project_success(client, mock_project_service, mock_user):
    """Тест успешного создания проекта."""
    payload = {"title": "New Project", "description": "Test"}

    # Создаём реальный объект ответа вместо MagicMock
    mock_project = make_project_read(id=1, title="New Project", description="Test")
    mock_project_service.create.return_value = mock_project

    response = await client.post("/projects", json=payload)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "New Project"
    assert data["description"] == "Test"
    mock_project_service.create.assert_called_once()


@pytest.mark.asyncio
async def test_get_projects_success(client, mock_project_service, mock_user):
    """Тест успешного получения списка проектов."""
    import math

    # Параметры пагинации
    total = 2
    page = 1
    count = 9
    total_pages = math.ceil(total / count)  # = 1

    # Page[ProjectRead] ожидает: {"data": [...], "meta": {...}}
    mock_page = {
        "data": [
            make_project_read(id=1, title="Proj1"),
            make_project_read(id=2, title="Proj2"),
        ],
        "meta": {
            "total": total,
            "currentPage": page,  # <--- обязательно
            "totalPages": total_pages,  # <--- обязательно
            "hasNextPage": page < total_pages,  # <--- обязательно
            # Опционально, если модель требует:
            # "pageSize": count,
            # "hasPreviousPage": page > 1,
        }
    }
    mock_project_service.get_projects_paginated.return_value = mock_page

    response = await client.get(
        "/projects",
        params={
            "search": "test",
            "statuses": "active",
            "sort_by": "created_at",
            "order": "desc",
            "page": 1,
            "count": 10
        }
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # Проверяем структуру ответа
    assert "data" in data
    assert "meta" in data
    assert len(data["data"]) == 2
    assert data["meta"]["currentPage"] == 1
    assert data["meta"]["totalPages"] == 1
    assert data["meta"]["hasNextPage"] is False
    assert data["data"][0]["title"] == "Proj1"

    mock_project_service.get_projects_paginated.assert_called_once()


@pytest.mark.asyncio
async def test_get_project_success(client, mock_project_service, mock_user):
    """Тест успешного получения проекта по ID."""
    mock_project = make_project_read(id=1, title="My Project")
    mock_project_service.get_by_id.return_value = mock_project

    response = await client.get("/projects/1")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "My Project"
    mock_project_service.get_by_id.assert_called_once_with(project_id=1, owner_id=mock_user.id)


@pytest.mark.asyncio
async def test_update_project_success(client, mock_project_service, mock_user):
    """Тест успешного обновления проекта."""
    # get_by_id возвращает существующий проект
    existing = make_project_read(id=1, title="Old Title")
    # update возвращает обновлённый
    updated = make_project_read(id=1, title="New Title", description="Updated")

    mock_project_service.get_by_id.return_value = existing
    mock_project_service.update.return_value = updated

    response = await client.patch("/projects/1", json={"title": "New Title", "description": "Updated"})

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "New Title"
    assert mock_project_service.update.called


@pytest.mark.asyncio
async def test_archive_project_success(client, mock_project_service, mock_user):
    """Тест успешного архивирования."""
    project = make_project_read(id=1, status=ProjectStatus.ACTIVE)
    archived = make_project_read(id=1, status=ProjectStatus.ARCHIVED_BY_USER)

    mock_project_service.get_by_id.return_value = project
    mock_project_service.archive.return_value = archived

    response = await client.patch("/projects/1/archive")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "archived_by_user"
    mock_project_service.archive.assert_called_once()


@pytest.mark.asyncio
async def test_unarchive_project_success(client, mock_project_service, mock_user):
    """Тест успешного разархивирования."""
    project = make_project_read(id=1, status=ProjectStatus.ARCHIVED_BY_USER)
    restored = make_project_read(id=1, status=ProjectStatus.ACTIVE)

    mock_project_service.get_by_id.return_value = project
    mock_project_service.unarchive.return_value = restored

    response = await client.patch("/projects/1/unarchive")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "active"
    mock_project_service.unarchive.assert_called_once()