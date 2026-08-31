from datetime import datetime, timezone

from httpx import AsyncClient
import pytest


def make_task_dict(
        id: int,
        description: str = "Test",
        title: str = "Test task",
        status: str = 'todo',
        priority: str = 'medium',
        progress: int = 0,
        subtasks: list = [],
        tags: list = [],
        attachments: list = [],
        reminders: list = [],
        **kwargs
):
    return {
        'id': id,
        'description': description,
        'title': title,
        'status': status,
        'priority': priority,
        'progress': progress,
        "created_at": kwargs.get("created_at", datetime.now(timezone.utc)),
        "updated_at": kwargs.get("updated_at", datetime.now(timezone.utc)),
        "archived_at": kwargs.get("archived_at", None),
        "subtasks": subtasks,
        "tags": tags,
        "attachments": attachments,
        "reminders": reminders,
    }

@pytest.mark.asyncio
async def test_create_task(client: AsyncClient, mock_task_service):
    list_id = 1
    task = make_task_dict(1)

    mock_task_service.create_task.return_value = task

    response = await client.post(f"/lists/{list_id}/tasks", json={
        "title": "Test task",
        "list_id": 1
    }
    )
    
    assert response.status_code == 201
    data = response.json()

    assert data["title"] == "Test task"
    mock_task_service.create_task.assert_called_once()

@pytest.mark.asyncio
async def test_get_tasks_by_list(client: AsyncClient, mock_task_service):
    list_id = 1
    mock_task_service.get_tasks_by_list_id.return_value = {
        "data": [make_task_dict(1), make_task_dict(2)],
        "meta": {
            "currentPage": 1,
            "totalPages": 1,
            "hasNextPage": False,
        }
    }

    response = await client.get(f"/lists/{list_id}/tasks")

    assert response.status_code == 200
    data = response.json()

    assert len(data["data"]) == 2
    mock_task_service.get_tasks_by_list_id.assert_called_once()

@pytest.mark.asyncio
async def test_search_tasks(client, mock_task_service):
    mock_task_service.search_task.return_value = {
        "data": [make_task_dict(1, title="Important task")],
        "meta": {
            "currentPage": 1,
            "totalPages": 1,
            "hasNextPage": False
        }
    }

    response = await client.get("/tasks?search=Important")

    assert response.status_code == 200
    data = response.json()

    assert data["data"][0]["title"] == "Important task"
    mock_task_service.search_task.assert_called_once()