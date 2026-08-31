from datetime import datetime, timezone, timedelta
import json
from typing import Optional

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.security import (
    create_jwt_token,
    verify_jwt_token,
    get_password_hash,
    verify_password,
)
from app.models import User
from app.repositories.user_repo import UserRepository
from app.models.user import User, UserCreate, UserRead, UserUpdate, BlockingEmail
from app.tasks.email import (
    send_verification_email_task,
    send_password_reset_email_task,
    notify_email_change_request_task,
    notify_new_device_login_task,
    notify_password_change_task,
    send_verification_new_email_task
)

import httpx as http_requests
from app.core.config import settings


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    if request.client:
        return request.client.host

    return "Неизвестно"


async def get_location(ip: str) -> dict:
    if ip == "Неизвестно":
        return {
            "country": "Localhost",
            "city": "Local Develop",
        }
    try:
        resp = http_requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        data = resp.json()

        if data.get("status") == "fail":
            return {"country": "Unknown", "city": "Unknown"}
        
        return {
            "country": data.get("country"),
            "city": data.get("city"),
            "latitude": data.get("lat"),
            "longitude": data.get("lon")
        }
    except:
        return {"country": "Unknown", "city": "Unknown"}


def get_device_info(request: Request) -> str:
    user_agent = request.headers.get("User-Agent", "")
    if not user_agent:
        return "Неизвестное устройство"

    device_info = []

    if "Windows" in user_agent:
        device_info.append("Windows")
    elif "Mac OS" in user_agent or "MacOS" in user_agent:
        device_info.append("macOS")
    elif "Linux" in user_agent:
        device_info.append("Linux")
    elif "Android" in user_agent:
        device_info.append("Android")
    elif "iPhone" in user_agent or "iPad" in user_agent:
        device_info.append("iOS")

    if "Chrome" in user_agent and "Edg" not in user_agent:
        device_info.append("Chrome")
    elif "Edg" in user_agent:
        device_info.append("Edge")
    elif "Firefox" in user_agent:
        device_info.append("Firefox")
    elif "Safari" in user_agent and "Chrome" not in user_agent:
        device_info.append("Safari")
    elif "Opera" in user_agent or "OPR" in user_agent:
        device_info.append("Opera")

    if "Mobile" in user_agent or "Android" in user_agent:
        device_type = "Мобильное устройство"
    elif "Tablet" in user_agent or "iPad" in user_agent:
        device_type = "Планшет"
    else:
        device_type = "Десктоп"

    return f"{device_type} ({', '.join(device_info)})" if device_info else device_type


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_auth_token(self, user: User) -> JSONResponse:
        """Создает пару токенов, сохраняет refresh в БД и 
        возвращает Response с кукой"""
        access_token = create_jwt_token(
            user.id, 
            token_type="access",
            version=user.token_version
            )
        refresh_token = create_jwt_token(
            user.id, 
            token_type="refresh",
            version=user.token_version
            )
        
        user.refresh_token = refresh_token
        await self.repo.save(user)
        
        response = JSONResponse(
            content={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
                }
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )
        
        return response
        
    async def _reset_block_if_expired(self, check_email: BlockingEmail, field_name: str) -> None:
        now = datetime.now(timezone.utc)
        locked_until = getattr(check_email, field_name)

        if locked_until and locked_until < now:
            setattr(check_email, field_name, None)

            if field_name == "locked_verify_email_until":
                check_email.verify_email_attempts = 0
                check_email.locked_verify_email_until = None
            elif field_name == "locked_reset_password_until":
                check_email.reset_password_attempts = 0
                check_email.locked_reset_password_until = None
            elif field_name == "locked_login_until":
                check_email.failed_login_attempts = 0
                check_email.locked_login_until=None

            await self.repo.save_blocking_email(check_email)

    async def send_verification_email(self, user: User) -> None:
        check_email = await self.repo.get_by_blocking_email(user.pending_email)
        if not check_email:
            raise ValueError("Запись блокировки email не найдена")

        await self._reset_block_if_expired(check_email, "locked_verify_email_until")

        if check_email.verify_email_attempts >= 5:
            if not check_email.locked_verify_email_until:
                check_email.locked_verify_email_until = datetime.now(timezone.utc) + timedelta(hours=1)
            check_email.reason_blocking = "Больше пяти запросов на верификацию почты."

            await self.repo.save_blocking_email(check_email)
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Пользователь с email-ом {check_email.email} заблокирован.",
                    "reason_blocking": check_email.reason_blocking,
                    "locked_until": f"{check_email.locked_verify_email_until}"
                }
            )

        check_email.verify_email_attempts += 1
        await self.repo.save_blocking_email(check_email)

        token = create_jwt_token(user.id, token_type="verify_email")

        send_verification_email_task.delay(user.pending_email, user.first_name, token)


    async def send_verification_new_email(self, user: User) -> None:
        check_email = await self.repo.get_by_blocking_email(user.pending_email)
        if not check_email:
            raise ValueError("Запись блокировки email не найдена")

        await self._reset_block_if_expired(check_email, "locked_verify_email_until")

        if check_email.verify_email_attempts >= 5:
            if not check_email.locked_verify_email_until:
                check_email.locked_verify_email_until = datetime.now(timezone.utc) + timedelta(hours=1)
            check_email.reason_blocking = "Больше пяти запросов на верификацию почты."

            await self.repo.save_blocking_email(check_email)
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Пользователь с email-ом {check_email.email} заблокирован.",
                    "reason_blocking": check_email.reason_blocking,
                    "locked_until": f"{check_email.locked_verify_email_until}"
                }
            )

        check_email.verify_email_attempts += 1
        await self.repo.save_blocking_email(check_email)

        token = create_jwt_token(user.id, token_type="verify_email")
        send_verification_new_email_task.delay(user.pending_email, user.first_name, token)


    async def send_password_reset_email(self, user: User) -> None:
        check_email = await self.repo.get_by_blocking_email(user.email)
        if not check_email:
            raise ValueError("Запись блокировки email не найдена")

        await self._reset_block_if_expired(check_email, "locked_reset_password_until")

        if check_email.reset_password_attempts >= 5:
            if not check_email.locked_reset_password_until:
                check_email.locked_reset_password_until = datetime.now(timezone.utc) + timedelta(hours=24)
            check_email.reason_blocking = "Больше пяти запросов на сброс пароля."
            await self.repo.save_blocking_email(check_email)
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Пользователь с email-ом {check_email.email} заблокирован.",
                    "reason_blocking": check_email.reason_blocking,
                    "locked_until": f"{check_email.locked_reset_password_until}"
                }
            )


        check_email.reset_password_attempts += 1
        await self.repo.save_blocking_email(check_email)

        token = create_jwt_token(user.id, token_type="reset_password")
        send_password_reset_email_task.delay(user.email, token)


    async def create_user(self, user_data: UserCreate) -> User:
        existing_user = await self.repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail=f"Пользователь с email {user_data.email} уже существует.",
            )

        user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            pending_email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            is_email_verified=False,
        )

        user = await self.repo.create(user)

        blocking_email = BlockingEmail(
            email=user_data.email,
            reason_blocking="",
            failed_login_attempts=0,
            reset_password_attempts=0,
            verify_email_attempts=0,
            locked_login_until=None,
            locked_verify_email_until=None,
            locked_reset_password_until=None,
        )

        await self.repo.create_blocking_email(blocking_email)
        await self.send_verification_email(user)
        return user

    async def verify_email(self, token: str) -> None:
        payload = verify_jwt_token(token, token_type="verify_email")
        user_id = payload.get("user_id")
        user = await self.repo.get_by_id(user_id)

        user.is_email_verified = True
        user.email = user.pending_email
        user.updated_at = datetime.now(timezone.utc)
        await self.repo.save(user)

    async def authenticate_user(self, email: str, password: str, request: Request) -> User:
        user = await self.repo.get_by_email(email)

        if not user:
            raise ValueError("Проверьте корректность введенных данных.")

        check_email = await self.repo.get_by_blocking_email(email)

        await self._reset_block_if_expired(check_email, "locked_login_until")

        if check_email.failed_login_attempts >= 5:
            if not check_email.locked_login_until:
                check_email.locked_login_until = datetime.now(timezone.utc) + timedelta(hours=1)
            check_email.reason_blocking = "Больше пяти раз введены некорректные данные для входа."
            await self.repo.save_blocking_email(check_email)
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Пользователь с email-ом {check_email.email} заблокирован.",
                    "reason_blocking": check_email.reason_blocking,
                    "locked_until": f"{check_email.locked_login_until}"
                }
            )

        if not verify_password(password, user.hashed_password):
            check_email.failed_login_attempts += 1
            await self.repo.save_blocking_email(check_email)
            raise ValueError("Проверьте корректность введенных данных.")

        check_email.failed_login_attempts = 0
        await self.repo.save_blocking_email(check_email)

        client_ip = get_client_ip(request)
        location_info = await get_location(client_ip)
        device_info = get_device_info(request)
        login_time = datetime.now().isoformat()

        is_new_session = True
        if user.last_location and user.last_device:
            try:
                stored_location = json.loads(user.last_location)
                if (stored_location == location_info
                    and device_info == user.last_device):
                    is_new_session = False
            except json.JSONDecodeError:
                is_new_session = True
        
        refresh_token = create_jwt_token(
            user.id,
            token_type="refresh",
            version=user.token_version
        )

        if is_new_session:
            notify_new_device_login_task.delay(
                user.email,
                json.dumps(location_info, ensure_ascii=False),
                login_time,
                device_info,
                refresh_token
            )

            user.last_location = json.dumps(location_info, ensure_ascii=False)
            user.last_device = device_info

        user.refresh_token = refresh_token
        await self.repo.save(user)

        return user

    async def refresh_tokens(self, refresh_token: str) -> dict:
        payload = verify_jwt_token(refresh_token, token_type="refresh")
        user_id = payload.get("user_id")
        token_version_from_token = payload.get("version")

        user = await self.repo.get_by_id(user_id)
        if not user or user.token_version != token_version_from_token:
            raise ValueError("Неправильный или истекший токен")

        access_token = create_jwt_token(
            user_id,
            token_type="access",
            version=user.token_version,
        )
        new_refresh_token = create_jwt_token(
            user_id,
            token_type="refresh",
            version=user.token_version,
        )

        user.refresh_token = new_refresh_token
        await self.repo.save(user)

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }

    async def get_user_by_email(self, email: str) -> Optional[User]:
        return await self.repo.get_by_email(email)

    async def get_user_by_pending_email(self, pending_email: str) -> Optional[User]:
        return await self.repo.get_by_pending_email(pending_email)

    async def reset_user_password(self, token: str, password: str, repeat_password: str) -> User:
        if password != repeat_password:
            raise ValueError("Пароли не совпадают")

        payload = verify_jwt_token(token, token_type="reset_password")
        user_id = payload.get("user_id")
        user = await self.repo.get_by_id(user_id)

        if not user:
            raise ValueError("Неверный или истекший токен для сброса пароля.")

        user.hashed_password = get_password_hash(password)
        user.updated_at = datetime.now(timezone.utc)
        await self.repo.save(user)

        notify_password_change_task.delay(user.email)

        return user

    async def invalidate_refresh_token(self, refresh_token: str, token_type) -> None:
        payload = verify_jwt_token(refresh_token, token_type=token_type)
        user_id = payload.get("user_id")
        user = await self.repo.get_by_id(user_id)

        if not user:
            raise ValueError("Неправильный или истекший токен")

        user.refresh_token = None
        await self.repo.save(user)

    async def get_profile(self, user_id: int) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserRead.model_validate(user)

    async def update_profile(self, user_id: int, user_update: UserUpdate):
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user_update.first_name:
            user.first_name = user_update.first_name
        if user_update.last_name:
            user.last_name = user_update.last_name

        if user_update.email and user_update.email != user.email:
            user.pending_email = user_update.email

            existing_block = await self.repo.get_by_email(user_update.email)
            if not existing_block:
                blocking_email = BlockingEmail(
                    email=user_update.email,
                    reason_blocking="",
                    failed_login_attempts=0,
                    reset_password_attempts=0,
                    verify_email_attempts=0,
                    locked_login_until=None,
                    locked_verify_email_until=None,
                    locked_reset_password_until=None,
                )
                await self.repo.create_blocking_email(blocking_email)

            await self.send_verification_new_email(user)

            token = create_jwt_token(user.id, token_type="refresh")
            notify_email_change_request_task.delay(user.email, token)

        password_changed = False
        if user_update.password and user_update.new_password:
            if not verify_password(user_update.password, user.hashed_password):
                raise ValueError("Неверный пароль")
            if user_update.password == user_update.new_password:
                raise ValueError("Новый пароль не может совпадать со старым.")

            user.hashed_password = get_password_hash(user_update.new_password)
            password_changed = True

        if user_update.email_notifications is not None:
            user.email_notifications = user_update.email_notifications

        if user_update.webpush_notifications is not None:
            user.webpush_notifications = user_update.webpush_notifications

        user.updated_at = datetime.now(timezone.utc)
        await self.repo.save(user)

        if password_changed:
            notify_password_change_task.delay(user.email)

        return UserRead.model_validate(user)

    async def update_avatar(self, user_id: int, avatar_path: str) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.avatar_path = avatar_path
        await self.repo.save(user)
        return UserRead.model_validate(user)

    async def delete_avatar(self, user_id: int) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.avatar_path = ""
        await self.repo.save(user)
        return UserRead.model_validate(user)

    async def logout_user(self, user_id: int) -> None:
        """Аннулирует refresh токен"""
        user = await self.repo.get_by_id(user_id)
        if user:
            user.token_version += 1
            await self.repo.save(user)

    async def logout_by_refresh_token(self, refresh_token: str) -> None:
        """Находит пользователя по refresh токену и завершает сессию"""
        payload = verify_jwt_token(refresh_token, token_type="refresh")
        user_id = payload.get("user_id")
        await self.logout_user(user_id)
