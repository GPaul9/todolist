"""JWT токены и пароли"""
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Хэширование пароля"""
    return pwd_context.hash(password)


def create_jwt_token(user_id: int, token_type: str, version: int = 1) -> str:
    if token_type == "access":
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    elif token_type == "refresh":
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    elif token_type == "verify_email":
        expire = datetime.utcnow() + timedelta(days=settings.VERIFY_EMAIL_TOKEN_EXPIRE_DAYS)
    elif token_type == "reset_password":
        expire = datetime.utcnow() + timedelta(minutes=settings.RESET_PASSWORD_TOKEN_EXPIRE_MINUTES)

    payload = {"user_id": user_id, "type": token_type, "exp": expire, "version": version}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_jwt_token(token: str, token_type: str) -> dict:
    if token_type == "access":
        """Проверка токена"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != token_type:
                raise ValueError(f"Неверный тип токена: ожидался {token_type}")
            return payload
        except ExpiredSignatureError:
            raise ValueError("Токен истек")
        except JWTError as exc:
            raise ValueError(f"Неверный access токен {exc}")

    if token_type == "refresh":
        """Проверка токена"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != token_type:
                raise ValueError(f"Неверный тип токена: ожидался {token_type}")
            return payload
        except ExpiredSignatureError:
            raise ValueError("Токен истек")
        except JWTError:
            raise ValueError("Неверный refresh токен")

    if token_type == "verify_email":
        """Проверка токена"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != token_type:
                raise ValueError(f"Неверный тип токена: ожидался {token_type}")
            return payload
        except ExpiredSignatureError:
            raise ValueError("Токен истек")
        except JWTError:
            raise ValueError("Неверный токен")

    if token_type == "reset_password":
        """Проверка токена"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != token_type:
                raise ValueError(f"Неверный тип токена: ожидался {token_type}")
            return payload
        except ExpiredSignatureError:
            raise ValueError("Токен истек")
        except JWTError:
            raise ValueError("Неверный токен")
