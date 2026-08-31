import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import AsyncMock
from io import BytesIO
from PIL import Image


client = TestClient(app)


def create_image_file(ext: str, size: tuple = (300, 300)) -> BytesIO:
    image = Image.new("RGB", size)
    buf = BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    return buf


@pytest.fixture(scope="function")
def app_with_mock_dependency():
    from app.dependencies import get_user_service, get_current_user

    def _get_user_service():
        service = AsyncMock()
        service.get_profile = AsyncMock()
        service.update_profile = AsyncMock()
        service.update_avatar = AsyncMock()
        return service

    def _get_current_user():
        u = AsyncMock()
        u.id = 1
        u.email = "test@example.com"
        u.first_name = "John"
        u.last_name = "Doe"
        u.avatar_path = None
        u.is_active = True
        u.is_email_verified = True
        return u

    app.dependency_overrides[get_user_service] = _get_user_service
    app.dependency_overrides[get_current_user] = _get_current_user

    yield app

    app.dependency_overrides.clear()


def test_get_profile_success(app_with_mock_dependency):
    user_data = {
        "id": 1,
        "email": "test@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_path": None,
        "is_active": True,
        "is_email_verified": True
    }

    with app.dependency_overrides[get_user_service] as mock_service:
        mock_service.get_profile = AsyncMock(return_value=user_data)

    response = client.get("/api/profile")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["email"] == "test@example.com"
    assert response.json()["first_name"] == "John"


def test_update_profile_success(app_with_mock_dependency):
    user_data = {
        "id": 1,
        "email": "test@example.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "avatar_path": None,
        "is_active": True,
        "is_email_verified": True
    }

    with app.dependency_overrides[get_user_service] as mock_service:
        mock_service.update_profile = AsyncMock(return_value=user_data)

    response = client.put(
        "/api/profile",
        json={
            "first_name": "Jane",
            "last_name": "Doe"
        }
    )

    assert response.status_code == 200
    assert response.json()["first_name"] == "Jane"
    assert response.json()["last_name"] == "Doe"


def test_update_avatar_success(app_with_mock_dependency):
    user_data = {
        "id": 1,
        "email": "test@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_path": "/static/avatars/test.png",
        "is_active": True,
        "is_email_verified": True
    }

    file = create_image_file(".png")
    with app_with_mock_dependency:
        with app.dependency_overrides[get_user_service] as mock_service:
            mock_service.update_avatar = AsyncMock(return_value=user_data)

        response = client.patch(
            "/api/profile/avatar",
            files={"avatar": ("avatar.png", file, "image/png")}
        )

    assert response.status_code == 200
    assert "/static/avatars/" in response.json()["avatar_path"]


def test_update_avatar_bad_extension(app_with_mock_dependency):
    response = client.patch(
        "/api/profile/avatar",
        files={"avatar": ("avatar.exe", b"fake", "application/octet-stream")}
    )

    assert response.status_code == 415
    assert "Поддерживаются только изображения (.jpg, .png, .webp)" in response.json()["detail"]


def test_update_avatar_too_large(app_with_mock_dependency):
    large_content = b"a" * (5 * 1024 * 1024 + 1)
    response = client.patch(
        "/api/profile/avatar",
        files={"avatar": ("large.jpg", large_content, "image/jpeg")}
    )

    assert response.status_code == 413
    assert "Файл слишком большой" in response.json()["detail"]


def test_update_avatar_wrong_mimetype(app_with_mock_dependency):
    response = client.patch(
        "/api/profile/avatar",
        files={"avatar": ("avatar.pdf", b"fake", "application/pdf")}
    )

    assert response.status_code == 415
    assert "Поддерживаются только JPG, PNG, WebP." in response.json()["detail"]


def test_update_avatar_invalid_image(app_with_mock_dependency):
    response = client.patch(
        "/api/profile/avatar",
        files={"avatar": ("avatar.png", b"not_an_image", "image/png")}
    )

    assert response.status_code == 422
    assert "Некорректный формат изображения." in response.json()["detail"]


def test_delete_avatar_no_avatar(app_with_mock_dependency):
    with app.dependency_overrides[get_current_user] as mock_user:
        u = AsyncMock()
        u.id = 1
        u.avatar_path = None
        app.dependency_overrides[get_current_user] = u

    response = client.delete("/api/profile/avatar")

    assert response.status_code == 404
    assert "Аватар не найден" in response.json()["detail"]


def test_delete_avatar_success(app_with_mock_dependency):
    user_data = {
        "id": 1,
        "email": "test@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_path": None,
        "is_active": True,
        "is_email_verified": True
    }

    with app.dependency_overrides[get_current_user] as mock_user:
        u = AsyncMock()
        u.id = 1
        u.avatar_path = "/static/avatars/test.png"
        app.dependency_overrides[get_current_user] = u

    with app.dependency_overrides[get_user_service] as mock_service:
        mock_service.update_avatar = AsyncMock(return_value=user_data)

    response = client.delete("/api/profile/avatar")

    assert response.status_code == 200
    assert response.json()["avatar_path"] is None