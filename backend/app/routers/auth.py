"""Auth роутер - регистрация, логин, OAuth2"""
import secrets
from fastapi import APIRouter, Depends, HTTPException, Request,\
    Query, Body
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
import json

from app.dependencies import get_user_service, get_current_user
from app.services.user_service import UserService
from app.core.security import (
    create_jwt_token,
    get_password_hash
)
from app.models.user import UserCreate, User, EmailVerification, \
    SendEmail, UserLogin, PasswordReset, SecurityLogout
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class GitlabUser(BaseModel):
    id: int
    username: str
    email: str
    name: str
    avatar_url: str | None = None


class GoogleUser(BaseModel):
    id: str
    email: str
    name: str
    picture: str | None = None
    verified_email: bool = False


# OAuth2 конфигурация
GITLAB_CLIENT_ID = settings.GITLAB_CLIENT_ID
GITLAB_CLIENT_SECRET = settings.GITLAB_CLIENT_SECRET
GITLAB_REDIRECT_URI = f"{settings.APP_URL}/auth/gitlab/callback"

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = f"{settings.APP_URL}/auth/google/callback"


@router.get("/gitlab/login")
async def gitlab_login():
    """Инициация входа через GitLab"""
    gitlab_auth_url = (
        "https://gitlab.com/oauth/authorize?"
        f"client_id={GITLAB_CLIENT_ID}&"
        f"redirect_uri={GITLAB_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=read_user email profile"
    )
    return {"auth_url": gitlab_auth_url}


@router.get("/gitlab/callback")
async def gitlab_callback(
        code: str,
        user_service: UserService = Depends(get_user_service)
):
    """Обработка callback от GitLab"""
    async with httpx.AsyncClient() as client:
        # Получаем токен доступа
        token_response = await client.post(
            "https://gitlab.com/oauth/token",
            data={
                "client_id": GITLAB_CLIENT_ID,
                "client_secret": GITLAB_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": GITLAB_REDIRECT_URI,
            }
        )
        token_data = token_response.json()

        if "error" in token_data:
            raise HTTPException(status_code=400, detail="GitLab auth failed")

        access_token = token_data["access_token"]

        # Получаем данные пользователя
        user_response = await client.get(
            "https://gitlab.com/api/v4/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        gitlab_user = GitlabUser(**user_response.json())

    # Ищем пользователя или создаем нового
    user = await user_service.get_user_by_email(gitlab_user.email)
    if not user:
        # Генерируем случайный пароль для OAuth пользователей
        random_password = secrets.token_urlsafe(32)
        user = User(
            first_name=gitlab_user.name.split()[0] if gitlab_user.name else gitlab_user.username,
            last_name=gitlab_user.name.split()[1] if len(gitlab_user.name.split()) > 1 else "",
            email=gitlab_user.email,
            hashed_password=get_password_hash(random_password),
            is_email_verified=True,
            gitlab_id=gitlab_user.id,
            avatar_path=gitlab_user.avatar_url
        )
        user = await user_service.repo.create(user)
    elif user.gitlab_id != gitlab_user.id:
        # Обновляем связь, если ID изменился или был пуст
        user.gitlab_id = gitlab_user.id
        user.avatar_path = gitlab_user.avatar_url
        await user_service.repo.save(user)

    return await user_service.create_auth_token(user)


@router.get("/google/login")
async def google_login():
    """Инициация входа через Google"""
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid email profile"
    )
    return {"auth_url": google_auth_url}


@router.get("/google/callback")
async def google_callback(
        code: str,
        user_service: UserService = Depends(get_user_service)
):
    """Обработка callback от Google"""
    async with httpx.AsyncClient() as client:
        # Получаем токен доступа
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": GOOGLE_REDIRECT_URI,
            }
        )
        token_data = token_response.json()

        if "error" in token_data:
            raise HTTPException(status_code=400, detail="Google auth failed")

        # Получаем данные пользователя
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        google_user = GoogleUser(**user_info_response.json())

    if not google_user.verified_email:
        raise HTTPException(status_code=400, detail="Google email not verified")

    # Ищем пользователя или создаем нового
    user = await user_service.get_user_by_email(google_user.email)
    if not user:
        random_password = secrets.token_urlsafe(32)
        user = User(
            first_name=google_user.name.split()[0] if google_user.name else "",
            last_name=google_user.name.split()[1] if len(google_user.name.split()) > 1 else "",
            email=google_user.email,
            hashed_password=get_password_hash(random_password),
            is_active=True,
            is_email_verified=True,
            google_id=google_user.id,
            avatar_path=google_user.picture
        )
        user = await user_service.repo.create(user)
    elif user.google_id != google_user.id:
        user.google_id = google_user.id
        user.avatar_path = google_user.picture
        await user_service.repo.save(user)

    return await user_service.create_auth_token(user)

@router.post("/register", status_code=201)
async def register_user(
        user_data: Annotated[UserCreate, Body()],
        service: UserService = Depends(get_user_service)
):
    """Регистрация пользователя"""
    try:
        user = await service.create_user(user_data)
        return {
            "message": "Пользователь зарегистрирован. Пожалуйста, проверьте свою электронную почту для подтверждения."}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confirm/verify", status_code=200)
async def verify_email(
        data: Annotated[EmailVerification, Body()],
        service: UserService = Depends(get_user_service)
):
    """Подтверждение email"""
    try:
        await service.verify_email(data.token)
        return {"message": "Адрес электронной почты успешно подтвержден."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/send-verification-email")
async def send_verification_email_endpoint(
        data: Annotated[SendEmail, Body()],
        user_service: UserService = Depends(get_user_service)
):
    try:
        user = await user_service.get_user_by_pending_email(data.email)
        if not user:
            raise ValueError("User not found")
        await user_service.send_verification_email(user)
        return {"message": "Письмо с подтверждением отправлено."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Для свагера авторизация
@router.post("/login", response_model=dict, summary="Только для свагера для тестов",
             description="Не использовать на фронте")
async def login_oauth(
        request: Request,
        form_data: OAuth2PasswordRequestForm = Depends(),
        service: UserService = Depends(get_user_service)
):
    """Вход пользователя"""
    try:
        user = await service.authenticate_user(
            form_data.username, form_data.password,
            request
        )
        return service.create_auth_token(user)
        # access_token = create_jwt_token(
        #     user.id,
        #     token_type="access",
        #     version=user.token_version,
        # )
        # refresh_token = create_jwt_token(
        #     user.id,
        #     token_type="refresh",
        #     version=user.token_version,
        # )

        # user.refresh_token = refresh_token
        # await service.repo.save(user)

        # response = JSONResponse(content={
        #     "access_token": access_token,
        #     "token_type": "bearer"
        # })
        # response.set_cookie(
        #     key="refresh_token",
        #     value=refresh_token,
        #     httponly=True,
        #     secure=settings.ENVIRONMENT == "production",
        #     samesite="lax",
        #     max_age=7 * 24 * 60 * 60  # 7 дней
        # )
        # return response
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/applogin", response_model=dict, summary="Авторизация пользователя через json")
async def login_json(
        request: Request,
        form_data: Annotated[UserLogin, Body()],
        service: UserService = Depends(get_user_service),
):
    """Вход пользователя через JSON"""
    try:
        user = await service.authenticate_user(
            form_data.email,
            form_data.password,
            request
        )
        return await service.create_auth_token(user)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh")
async def refresh(
        request: Request,
        service: UserService = Depends(get_user_service)
):
    """Обновление access токена"""
    old_refresh_token = request.cookies.get("refresh_token")
    if not old_refresh_token:
        raise HTTPException(status_code=401, detail="Refresh токен не найден.")

    try:
        tokens = await service.refresh_tokens(old_refresh_token)

        response = JSONResponse(content=tokens)
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=7 * 24 * 60 * 60  # 7 дней
        )
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
async def logout(
        request: Request,
        service: UserService = Depends(get_user_service)
):
    """Выход пользователя"""
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        response = JSONResponse(content={"message": "Вы вышли из системы."})
        response.delete_cookie("refresh_token")
        return response
        # raise HTTPException(status_code=401, detail="Refresh токен не найден.")

    try:
        await service.logout_by_refresh_token(refresh_token)
        await service.invalidate_refresh_token(
            refresh_token,
            token_type="refresh"
        )
    except ValueError:
        pass

    response = JSONResponse(content={"message": "Вышел из системы успешно."})
    response.delete_cookie("refresh_token")
    return response


@router.post("/security/logout")
async def security_logout(
        current_user: Annotated[User, Depends(get_current_user)],
        data: SecurityLogout,
        service: UserService = Depends(get_user_service),
):
    await service.invalidate_refresh_token(data.token, token_type="refresh")

    response = JSONResponse(content={"message": "Вышел из системы успешно."})

    await service.logout_user(user_id=current_user.id)
    return response


@router.post("/forgot-password")
async def forgot_password(
        data: Annotated[SendEmail, Body()],
        service: UserService = Depends(get_user_service)
):
    """Запрос сброса пароля"""
    try:
        user = await service.get_user_by_email(data.email)
        if not user:
            raise ValueError("User not found")
        await service.send_password_reset_email(user)
        return {"message": "Письмо для сброса пароля отправлено."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset/verify")
async def reset_password(
        data: Annotated[PasswordReset, Body()],
        service: UserService = Depends(get_user_service)
):
    try:
        await service.reset_user_password(data.token, data.password, data.repeat_password)
        return {"message": "Пароль успешно сброшен"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
