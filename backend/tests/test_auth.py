import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.user_service import UserService
from unittest.mock import AsyncMock

client = TestClient(app)


def get_mock_user_service():
    service = AsyncMock(spec=UserService)
    service.get_user_by_email = AsyncMock(return_value=None)
    service.create_user = AsyncMock()
    service.authenticate_user = AsyncMock()
    service.verify_email = AsyncMock()
    service.reset_user_password = AsyncMock()
    service.refresh_tokens = AsyncMock(return_value=("test_access", "test_refresh"))
    service.invalidate_refresh_token = AsyncMock()
    return service


@pytest.fixture(scope="function")
def override_dependency():
    from app.dependencies import get_user_service

    def _get_user_service():
        return get_mock_user_service()

    app.dependency_overrides[get_user_service] = _get_user_service

    yield

    app.dependency_overrides.clear()


# ---- Регистрация ----

def test_register_user(override_dependency):
    data = {
        "email": "test@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "secret123"
    }

    response = client.post("/api/auth/register", json=data)

    assert response.status_code == 201
    assert "User registered" in response.json()["message"]


# ---- Логин (applogin) ----

def test_applogin_success(override_dependency):
    mock_user = AsyncMock()
    mock_user.id = 1

    with app.dependency_overrides[app.dependency_overrides[get_mock_user_service()]] as mock_service:
        mock_service.authenticate_user = AsyncMock(return_value=mock_user)

    response = client.post(
        "/api/auth/applogin",
        json={
            "email": "test@example.com",
            "password": "secret123"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.cookies


def test_applogin_wrong_password(override_dependency):
    with app.dependency_overrides[app.dependency_overrides[get_mock_user_service()]] as mock_service:
        mock_service.authenticate_user = AsyncMock(
            side_effect=ValueError("Invalid credentials")
        )

    response = client.post(
        "/api/auth/applogin",
        json={
            "email": "test@example.com",
            "password": "wrong"
        }
    )

    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


# ---- OAuth2: GitLab ----

def test_gitlab_login_redirect(override_dependency):
    response = client.get("/api/auth/gitlab/login")

    assert response.status_code == 200
    assert "auth_url" in response.json()
    assert "gitlab.com/oauth/authorize" in response.json()["auth_url"]


def test_gitlab_callback_success(override_dependency):
    mock_user = AsyncMock()
    mock_user.id = 1

    app.dependency_overrides[get_mock_user_service()].get_user_by_email = AsyncMock(return_value=None)
    app.dependency_overrides[get_mock_user_service()].create_user = AsyncMock(return_value=mock_user)

    # Мокаем httpx.AsyncClient внутри роутера неявно — через моки роутера
    # В реальности можно также замокать httpx.AsyncClient

    response = client.get("/api/auth/gitlab/callback?code=test_code")

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.cookies


# ---- OAuth2: Google ----

def test_google_login_redirect(override_dependency):
    response = client.get("/api/auth/google/login")

    assert response.status_code == 200
    assert "auth_url" in response.json()
    assert "accounts.google.com/o/oauth2/v2/auth" in response.json()["auth_url"]


def test_google_callback_success(override_dependency):
    mock_user = AsyncMock()
    mock_user.id = 1

    app.dependency_overrides[get_mock_user_service()].get_user_by_email = AsyncMock(return_value=None)
    app.dependency_overrides[get_mock_user_service()].create_user = AsyncMock(return_value=mock_user)

    response = client.get("/api/auth/google/callback?code=test_code")

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.cookies


# ---- Refresh / Logout ----

def test_refresh_success(override_dependency):
    # Подготовка: получаем тест‑refresh токен
    # В тестах можно использовать мок‑`create_refresh_token` или просто подставить строку
    client.cookies.clear()
    client.cookies.set("refresh_token", "test_refresh")

    with app.dependency_overrides[get_mock_user_service()] as mock_service:
        mock_service.refresh_tokens = AsyncMock(return_value=("new_access", "new_refresh"))

    response = client.post("/api/auth/refresh")

    assert response.status_code == 200
    assert response.json()["access_token"] == "new_access"
    assert response.cookies["refresh_token"] == "new_refresh"


def test_logout(override_dependency):
    client.cookies.clear()
    client.cookies.set("refresh_token", "test_refresh")

    with app.dependency_overrides[get_mock_user_service()] as mock_service:
        mock_service.invalidate_refresh_token = AsyncMock()

    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert "Logged out successfully" in response.json()["message"]
    mock_service.invalidate_refresh_token.assert_called()


# ---- Подтверждение email ----

def test_verify_email(override_dependency):
    with app.dependency_overrides[get_mock_user_service()] as mock_service:
        mock_service.verify_email = AsyncMock()

    response = client.post("/api/auth/confirm/verify", json={"token": "test_token"})

    assert response.status_code == 200
    assert "Email verified successfully" in response.json()["message"]
    mock_service.verify_email.assert_called_with("test_token")


def test_send_verification_email_endpoint(override_dependency):
    user = AsyncMock()
    user.email = "test@example.com"

    with app.dependency_overrides[get_mock_user_service()] as mock_service:
        mock_service.get_user_by_email = AsyncMock(return_value=user)
        mock_service.send_verification_email = AsyncMock()

    response = client.post("/api/auth/send-verification-email?email=test@example.com")

    assert response.status_code == 200
    assert "Verification email sent" in response.json()["message"]
    mock_service.send_verification_email.assert_called_with(user)


# ---- Сброс пароля ----

def test_reset_password_success(override_dependency):
    with app.dependency_overrides[get_mock_user_service()] as mock_service:
        mock_service.reset_user_password = AsyncMock()

    response = client.post(
        "/api/auth/reset/verify",
        json={
            "token": "reset_token",
            "new_password": "new_secret",
            "confirm_password": "new_secret"
        }
    )

    assert response.status_code == 200
    assert "успешно сброшен" in response.json()["message"]
    mock_service.reset_user_password.assert_called_with("reset_token", "new_secret")


def test_reset_password_mismatch(override_dependency):
    response = client.post(
        "/api/auth/reset/verify",
        json={
            "token": "reset_token",
            "new_password": "new_secret",
            "confirm_password": "other"
        }
    )

    assert response.status_code == 400
    assert "Пароли не совпадают" in response.json()["detail"]