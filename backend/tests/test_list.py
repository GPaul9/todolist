import pytest
import math
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import status
from httpx import AsyncClient

from app.models.user import User
from app.models.enums import TaskListStatus


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def make_task_list_obj(
    id: int,
    title: str = "Test List",
    status: str = "active",
    project_id: int = 1,
    order: int = 0,
    **kwargs
):
    """Создаёт MagicMock-объект с атрибутами для мокирования репозитория/сервиса."""
    from unittest.mock import MagicMock
    obj = MagicMock()
    obj.id = id
    obj.title = title
    obj.order = order
    obj.status = status
    obj.project_id = project_id
    obj.created_at = kwargs.get("created_at", datetime.now(timezone.utc))
    obj.total_tasks = kwargs.get("total_tasks", 0)
    obj.completed_tasks = kwargs.get("completed_tasks", 0)
    return obj

def make_list_dict(
    id: int,
    title: str = "Test List",
    status: str = "active",  # ✅ Строка, а не энум — для валидации ответа
    project_id: int = 1,
    order: int = 0,
    **kwargs
):
    """Создаёт словарь, совместимый с моделью ListRead."""
    return {
        "id": id,
        "title": title,
        "order": order,
        "status": status,
        "created_at": kwargs.get("created_at", datetime.now(timezone.utc)),
        "project_id": project_id,
        "total_tasks": kwargs.get("total_tasks", 0),
        "completed_tasks": kwargs.get("completed_tasks", 0),
    }


# -----------------------------------------------------------------------------
# GET LISTS
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_lists_by_project_success(client: AsyncClient, mock_tasklist_service):
    project_id = 1

    # ✅ Сервис ожидает, что get_lists_paginated вернёт Page[ListRead]
    mock_tasklist_service.get_lists_paginated.return_value = {
        "data": [
            make_list_dict(id=1, title="List 1", project_id=project_id, order=0),
            make_list_dict(id=2, title="List 2", project_id=project_id, order=1),
        ],
        "meta": {
            "currentPage": 1,
            "totalPages": 1,
            "hasNextPage": False,
        }
    }

    response = await client.get(
        f"/lists/project/{project_id}",
        params={"page": 1, "count": 10}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["data"]) == 2
    assert data["data"][0]["title"] == "List 1"
    assert data["meta"]["currentPage"] == 1


@pytest.mark.asyncio
async def test_get_lists_by_project_empty(client: AsyncClient, mock_tasklist_service):
    project_id = 1

    mock_tasklist_service.get_lists_paginated.return_value = {
        "data": [],
        "meta": {
            "currentPage": 1,
            "totalPages": 0,  # ✅ 0 при пустом списке
            "hasNextPage": False,
        }
    }

    response = await client.get(f"/lists/project/{project_id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"] == []
    assert data["meta"]["totalPages"] == 0


# -----------------------------------------------------------------------------
# REORDER
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_reorder_task_lists_success(
    client: AsyncClient,
    mock_tasklist_service,
    mock_user: User
):
    project_id = 1
    ordered_ids = [1, 2, 3]

    payload = {
        "project_id": project_id,
        "ordered_ids": ordered_ids
    }

    mock_tasklist_service.reorder_lists.return_value = None

    response = await client.post("/lists/reorder", json=payload)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_tasklist_service.reorder_lists.assert_called_once_with(
        owner_id=mock_user.id,
        project_id=project_id,
        ordered_ids=ordered_ids
    )


# -----------------------------------------------------------------------------
# ARCHIVE
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_archive_task_list_success(
    client: AsyncClient,
    mock_tasklist_service,
    mock_user: User
):
    list_id = 1

    # ✅ get_by_id возвращает объект с атрибутами (для проверки .status в роутере)
    original = make_task_list_obj(id=list_id, status="active")
    # ✅ archive возвращает словарь (для валидации ответа через TaskListRead)
    archived = make_list_dict(id=list_id, status="archived_by_user")

    mock_tasklist_service.get_by_id.return_value = original
    mock_tasklist_service.archive.return_value = archived

    response = await client.patch(f"/lists/{list_id}/archive")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "archived_by_user"
    mock_tasklist_service.archive.assert_called_once()


@pytest.mark.asyncio
async def test_archive_task_list_not_found(client: AsyncClient, mock_tasklist_service):
    list_id = 999
    mock_tasklist_service.get_by_id.return_value = None

    response = await client.patch(f"/lists/{list_id}/archive")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    # ✅ Исправлено: в роутере "Task list not found" (с пробелом)
    assert response.json()["detail"] == "Task list not found"


# -----------------------------------------------------------------------------
# UNARCHIVE
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_unarchive_task_list_success(
    client: AsyncClient,
    mock_tasklist_service,
    mock_user: User
):
    list_id = 1

    # ✅ get_by_id возвращает объект с атрибутами
    archived = make_task_list_obj(id=list_id, status="archived_by_user")
    # ✅ unarchive возвращает словарь для валидации ответа
    restored = make_list_dict(id=list_id, status="active")

    mock_tasklist_service.get_by_id.return_value = archived
    mock_tasklist_service.unarchive.return_value = restored

    response = await client.patch(f"/lists/{list_id}/unarchive")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    mock_tasklist_service.unarchive.assert_called_once()


@pytest.mark.asyncio
async def test_unarchive_task_list_not_found(client: AsyncClient, mock_tasklist_service):
    list_id = 999
    mock_tasklist_service.get_by_id.return_value = None

    response = await client.patch(f"/lists/{list_id}/unarchive")

    assert response.status_code == status.HTTP_404_NOT_FOUND


# -----------------------------------------------------------------------------
# DELETE
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_delete_task_list_success(client: AsyncClient, mock_tasklist_service, mock_user: User):
    list_id = 1
    mock_tasklist_service.delete.return_value = None

    response = await client.delete(f"/lists/{list_id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_tasklist_service.delete.assert_called_once_with(
        list_id=list_id,
        owner_id=mock_user.id
    )


# -----------------------------------------------------------------------------
# VALIDATION
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_lists_validation_page_negative(client: AsyncClient):
    response = await client.get("/lists/project/1", params={"page": 0})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
async def test_get_lists_validation_count_negative(client: AsyncClient):
    response = await client.get("/lists/project/1", params={"count": 0})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY