from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    VERIFY_EMAIL_TOKEN_EXPIRE_DAYS: int
    RESET_PASSWORD_TOKEN_EXPIRE_MINUTES: int

    # SMTP
    SMTP_HOST: str 
    SMTP_PORT: int 
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str
    TEMPLATES_DIR: str 

    # Redis/Celery
    REDIS_URL: str
    CELERY_CHECK_TIMER: int
    CELERY_CHECK_MINIO_TIMER: int = 300

    # URLs
    APP_URL: str
    FRONTEND_URL: str

    # OAuth2 настройки
    GITLAB_CLIENT_ID: str
    GITLAB_CLIENT_SECRET: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    ENVIRONMENT: str = "development"

    MINIO_INTERNAL_ENDPOINT: str
    MINIO_PUBLIC_ENDPOINT: str
    MINIO_REGION: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_EXPIRES_UPLOAD_URL: int = 15
    MINIO_BUCKET: str
    MINIO_CLEANUP_TIME: int = 900

    VAPID_PUBLIC_KEY: str
    VAPID_PRIVATE_KEY: str
    VAPID_SUBJECT: str

    ALLOWED_COLORS: list = [
        '#994D65',
  '#994D4D',
  '#996D4D',
  '#94994D',
  '#3C8B41',
  '#3FB4B4',
  '#426CBC',
  '#784D99',
  '#757575'
    ]

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
        "env_file_encoding": "utf-8"
    }


settings = Settings() # type: ignore
