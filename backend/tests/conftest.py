import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.dependencies import get_current_user
from app.services.project_service import get_project_service
from app.services.list_service import get_tasklist_service
from app.models.user import User
from app.dependencies import get_task_service, get_subtask_service
# from app.services.subtask_service import get_subtask_service
from app.services.tag_service import get_tag_service


@pytest.fixture
def test_app():
    """Создает приложение и подключает ВСЕ роутеры для тестов."""
    from app.routers.projects import router as projects_router
    from app.routers.lists import router as lists_router
    from app.routers.tasks import router as tasks_router

    app = FastAPI()
    app.include_router(projects_router)
    app.include_router(lists_router)
    app.include_router(tasks_router)
    # app.include_router(subtask_router)
    # app.include_router(tag_router)
    return app


@pytest.fixture
def mock_user():
    """Фикстура тестового пользователя."""
    return User(
        id=1,
        email="test@example.com",
        username="testuser", # type: ignore
        is_active=True,
        is_email_verified=True,
        email_notifications=True
    ) # type: ignore


@pytest.fixture
def mock_project_service():
    """Полностью замоканный сервис проектов."""
    service = AsyncMock()
    service.create = AsyncMock()
    service.get_by_id = AsyncMock()
    service.update = AsyncMock()
    service.get_projects_paginated = AsyncMock()
    service.archive = AsyncMock()
    service.unarchive = AsyncMock()
    service.delete = AsyncMock()
    return service


@pytest.fixture
def mock_tasklist_service():
    """Простой мок сервиса списков — все методы асинхронные."""
    # from unittest.mock import AsyncMock - уже импортировано выше.

    service = AsyncMock()
    # Явно создаём асинхронные моки для всех методов сервиса
    service.create = AsyncMock()
    service.get_by_id = AsyncMock()
    service.update = AsyncMock()
    service.get_lists_paginated = AsyncMock()
    service.reorder_lists = AsyncMock()
    service.archive = AsyncMock()
    service.unarchive = AsyncMock()
    service.delete = AsyncMock()
    return service


@pytest.fixture
def mock_task_service():
    """"""
    service = AsyncMock()
    service.create_task = AsyncMock()
    service.get_by_id = AsyncMock()
    service.update = AsyncMock()
    service.search_task = AsyncMock()
    service.delete = AsyncMock()
    return service


@pytest.fixture
def mock_subtask_service():
    service = AsyncMock()
    service.create = AsyncMock()
    service.update = AsyncMock()
    service.delete = AsyncMock()
    return service


@pytest.fixture
def mock_tag_service():
    service = AsyncMock()
    service.create = AsyncMock()
    service.delete = AsyncMock()
    service.assign = AsyncMock()
    return service


# -----------------------------------------------------------------------------
# Клиент
# -----------------------------------------------------------------------------

@pytest.fixture
async def client(test_app, mock_user, mock_project_service,
                 mock_tasklist_service, mock_task_service,
                 mock_subtask_service, mock_tag_service):
    """Тестовый клиент с переопределением ВСЕХ зависимостей."""

    async def override_get_current_user():
        return mock_user

    async def override_get_project_service():
        return mock_project_service

    async def override_get_tasklist_service():
        return mock_tasklist_service

    async def override_get_task_service():
        return mock_task_service

    async def override_get_subtask_service():
        return mock_subtask_service

    async def override_get_tag_service():
        return mock_tag_service

    test_app.dependency_overrides[get_current_user] = override_get_current_user
    test_app.dependency_overrides[get_project_service] = override_get_project_service
    test_app.dependency_overrides[get_tasklist_service] = override_get_tasklist_service
    test_app.dependency_overrides[get_task_service] = override_get_task_service
    # test_app.dependency_overrides[get_subtask_service] = override_get_subtask_service
    # test_app.dependency_overrides[get_tag_service] = override_get_tag_service

    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    test_app.dependency_overrides.clear()
