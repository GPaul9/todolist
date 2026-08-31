from datetime import datetime, timezone
from typing import Optional, List
import re

from pydantic import EmailStr, field_validator
from pydantic_core.core_schema import ValidationInfo
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime


def _validate_password_rules(password: str) -> None:
    if not 12 <= len(password) <= 100:
        raise ValueError("Пароль должен содержать от 12 до 100 символов.")
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password):
        raise ValueError("Пароль должен содержать: заглавную и строчную букву.")
    if not re.search(r"\d", password):
        raise ValueError("Пароль должен содержать цифру.")

    if not re.search(r"[!$%^*()_+\=\[\]\{\}\|:,\.\?]", password):
        raise ValueError(
            "Пароль должен содержать спецсимвол (например ! $ % ^ * ( ) _ + = [ ] { } | : , . ?)."
        )
    if re.search(r"""['"\\/;\-#<>@& ]""", password):
        raise ValueError("Пароль содержит недопустимый символ.")


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: Optional[str] = Field(default="")
    pending_email: Optional[EmailStr] = Field(default="")
    hashed_password: str = Field(max_length=255)
    avatar_path: Optional[str] = Field(default="")
    is_email_verified: bool = Field(default=False)
    refresh_token: Optional[str] = None
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    gitlab_id: Optional[int] = None
    google_id: Optional[str] = None

    email_notifications: bool = Field(default=True)
    webpush_notifications: bool = Field(default=False)

    last_location: Optional[str] = Field(default="")
    last_device: Optional[str] = Field(default="")
    token_version: int = Field(default=1)

    projects: List["Project"] = Relationship(back_populates="owner")
    tags: List["Tag"] = Relationship(back_populates="user")


class UserCreate(SQLModel):
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: str
    password: str
    repeat_password: str
    consent_personal_data: bool = Field(default=False)
    privacy_policy_agreement: bool = Field(default=False)
    email_notifications: bool = Field(default=True)
    webpush_notifications: bool = Field(default=False)

    @field_validator('email')
    def validate_email_custom(cls, v: str) -> str:
        # Проверка общей длины (не более 254)
        if len(v) > 254:
            raise ValueError('Общая длина email должна быть не более 254 символов')

        # Проверка на пробелы
        if ' ' in v:
            raise ValueError('Пробелы недопустимы в email')

        # Проверка на недопустимые символы: ', ", \, ;, #, <, >, /, &
        invalid_chars = ["'", '"', '\\', ';', '#', '<', '>', '/', '&']
        for char in invalid_chars:
            if char in v:
                raise ValueError(f'Недопустимый символ в email: {char}')

        # Проверка на двойной дефис и двойную точку
        if '--' in v or '..' in v:
            raise ValueError('Двойной дефис (--) и двойная точка (..) недопустимы')

        # Проверка начала email с . или -
        if v.startswith('.') or v.startswith('-'):
            raise ValueError('Email не может начинаться с . или -')

        # Разделение на локальную часть и домен
        if '@' not in v:
            raise ValueError('Email должен содержать @')

        parts = v.split('@', 1)
        if len(parts) != 2:
            raise ValueError('Email должен содержать одну @')

        local_part, domain = parts

        # Проверка длины локальной части (до 64)
        if len(local_part) == 0:
            raise ValueError('Локальная часть email пустая')
        if len(local_part) > 64:
            raise ValueError('Локальная часть email должна быть до 64 символов')

        # Проверка длины домена (до 159)
        if len(domain) == 0:
            raise ValueError('Домен email пустой')
        if len(domain) > 159:
            raise ValueError('Домен email должен быть до 159 символов')

        # Проверка на допустимые символы (латинские буквы, цифры, @, ., -, _)
        allowed_pattern = re.compile(r'^[a-zA-Z0-9@.\-_]+$')
        if not allowed_pattern.match(v):
            raise ValueError('В email допустимы только латинские буквы, цифры, @, ., -, _')

        # Проверка, что домен содержит хотя одну точку (поддомен)
        if '.' not in domain:
            raise ValueError('Домен должен содержать хотя одну точку (например, example.com)')

        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str, info: ValidationInfo) -> str:
        _validate_password_rules(v)
        email = info.data.get("email")
        if email and email.lower() in v.lower():
            raise ValueError("Пароль не должен содержать email.")
        return v

    @field_validator("repeat_password", mode="after")
    @classmethod
    def validate_repeat_password(cls, v: str, info: ValidationInfo) -> str:
        password_value = info.data.get("password")
        if password_value is None:
            raise ValueError("Поле password обязательно.")
        if password_value != v:
            raise ValueError("Пароли не совпадают.")
        return v

    @field_validator("consent_personal_data")
    @classmethod
    def validate_consent_personal_data(cls, v: bool) -> bool:
        if not v:
            raise ValueError(
                "Пожалуйста, подтвердите свое согласие на обработку персональных данных."
            )
        return v

    @field_validator("privacy_policy_agreement")
    @classmethod
    def validate_privacy_policy_agreement(cls, v: bool) -> bool:
        if not v:
            raise ValueError(
                "Пожалуйста, подтвердите свое согласие с политикой конфиденциальности."
            )
        return v


class UserUpdate(SQLModel):
    first_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[str] = Field(default=None)
    password: Optional[str] = Field(default=None)
    new_password: Optional[str] = Field(default=None)
    email_notifications: Optional[bool] = Field(default=None)
    webpush_notifications: Optional[bool] = Field(default=None)

    @field_validator('email')
    def validate_email_custom(cls, v: str) -> str:
        # Проверка общей длины (не более 254)
        if len(v) > 254:
            raise ValueError('Общая длина email должна быть не более 254 символов')

        # Проверка на пробелы
        if ' ' in v:
            raise ValueError('Пробелы недопустимы в email')

        # Проверка на недопустимые символы: ', ", \, ;, #, <, >, /, &
        invalid_chars = ["'", '"', '\\', ';', '#', '<', '>', '/', '&']
        for char in invalid_chars:
            if char in v:
                raise ValueError(f'Недопустимый символ в email: {char}')

        # Проверка на двойной дефис и двойную точку
        if '--' in v or '..' in v:
            raise ValueError('Двойной дефис (--) и двойная точка (..) недопустимы')

        # Проверка начала email с . или -
        if v.startswith('.') or v.startswith('-'):
            raise ValueError('Email не может начинаться с . или -')

        # Разделение на локальную часть и домен
        if '@' not in v:
            raise ValueError('Email должен содержать @')

        parts = v.split('@', 1)
        if len(parts) != 2:
            raise ValueError('Email должен содержать одну @')

        local_part, domain = parts

        # Проверка длины локальной части (до 64)
        if len(local_part) == 0:
            raise ValueError('Локальная часть email пустая')
        if len(local_part) > 64:
            raise ValueError('Локальная часть email должна быть до 64 символов')

        # Проверка длины домена (до 159)
        if len(domain) == 0:
            raise ValueError('Домен email пустой')
        if len(domain) > 159:
            raise ValueError('Домен email должен быть до 159 символов')

        # Проверка на допустимые символы (латинские буквы, цифры, @, ., -, _)
        allowed_pattern = re.compile(r'^[a-zA-Z0-9@.\-_]+$')
        if not allowed_pattern.match(v):
            raise ValueError('В email допустимы только латинские буквы, цифры, @, ., -, _')

        # Проверка, что домен содержит хотя одну точку (поддомен)
        if '.' not in domain:
            raise ValueError('Домен должен содержать хотя одну точку (например, example.com)')

        return v.lower()

    @field_validator("new_password", mode="before")
    @classmethod
    def validate_new_password(cls, v: Optional[str], info: ValidationInfo) -> Optional[str]:
        if v is None:
            return v
        _validate_password_rules(v)
        email = info.data.get("email")
        if email and email.lower() in v.lower():
            raise ValueError("Пароль не должен содержать email.")
        old_password = info.data.get("password")
        if old_password and old_password == v:
            raise ValueError("Новый пароль не должен совпадать со старым.")
        return v


class UserRead(SQLModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    avatar_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    email_notifications: bool
    webpush_notifications: bool


class UserLogin(SQLModel):
    email: EmailStr
    password: str


class PasswordReset(SQLModel):
    token: str
    password: str
    repeat_password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str, info: ValidationInfo) -> str:
        _validate_password_rules(v)
        email = info.data.get("email")
        if email and email.lower() in v.lower():
            raise ValueError("Пароль не должен содержать email.")
        return v

    @field_validator("repeat_password", mode="after")
    @classmethod
    def validate_repeat_password(cls, v: str, info: ValidationInfo) -> str:
        password_value = info.data.get("password")
        if password_value is None:
            raise ValueError("Поле password обязательно.")
        if password_value != v:
            raise ValueError("Пароли не совпадают.")
        return v


class BlockingEmail(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: Optional[str] = Field(default="")
    reason_blocking: Optional[str] = Field(default="")
    failed_login_attempts: int = Field(default=0)
    reset_password_attempts: int = Field(default=0)
    verify_email_attempts: int = Field(default=0)
    locked_login_until: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default=None,
    )
    locked_verify_email_until: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default=None,
    )
    locked_reset_password_until: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default=None,
    )


class EmailVerification(SQLModel):
    token: str


class SendEmail(SQLModel):
    email: str


class SecurityLogout(SQLModel):
    token: str
