from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
import os
import uuid
import aiofiles
from PIL import Image
from app.dependencies import get_db, get_current_user, get_user_service
from app.services.user_service import UserService
from app.models.user import UserUpdate, UserRead, User
import io

router = APIRouter(tags=["profile"])

# Настройки для загрузки аватаров
UPLOAD_DIR = "static/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_MIMETYPES = {
    "image/jpeg", "image/png"
}


def is_allowed_filename(filename: str) -> bool:
    """Проверка расширения файла"""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)


def generate_secure_filename(original_filename: str) -> str:
    """Генерация безопасного имени файла"""
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".png"
    return f"{uuid.uuid4()}{ext}"


async def validate_and_process_avatar(file: UploadFile) -> str:
    """Валидация и обработка аватара"""
    # Проверка размера
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Файл слишком большой. Максимум 2MB."
        )

    # Проверка типа контента
    if file.content_type not in ALLOWED_MIMETYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Поддерживаются только JPG, PNG."
        )

    # Чтение и проверка изображения
    content = await file.read()
    try:
        image = Image.open(io.BytesIO(content))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Некорректный формат изображения."
        )

    # Определяем оптимальный размер для аватара (например, 400x400)
    image.thumbnail((400, 400), Image.Resampling.LANCZOS)

    # Генерируем безопасное имя файла
    secure_filename = generate_secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, secure_filename)

    # Сохраняем обработанное изображение
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True, quality=85)
    buffer.seek(0)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(buffer.getvalue())

    # Возвращаем относительный путь для хранения в БД
    return f"/static/avatars/{secure_filename}"


@router.get("/profile", response_model=UserRead)
async def get_profile(
        current_user: Annotated[User, Depends(get_current_user)],
        service: Annotated[UserService, Depends(get_user_service)]
):
    """Получить профиль текущего пользователя"""
    return await service.get_profile(current_user.id)


@router.patch("/profile", response_model=UserRead)
async def update_profile(
        user_update: Annotated[UserUpdate, Body()],
        current_user: Annotated[User, Depends(get_current_user)],
        service: Annotated[UserService, Depends(get_user_service)]
):
    try:
        """Обновить профиль пользователя"""
        return await service.update_profile(current_user.id, user_update)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/profile/avatar")
async def update_avatar(
        current_user: Annotated[User, Depends(get_current_user)],
        service: Annotated[UserService, Depends(get_user_service)],
        avatar: UploadFile = File(..., description="Аватар пользователя")
):
    """
    Обновить аватар пользователя

    Принимает multipart/form-data с файлом аватара.
    Автоматически валидирует размер, тип и формат.
    """
    if not is_allowed_filename(avatar.filename):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Поддерживаются только изображения (.jpg, .png)"
        )

    avatar_path = await validate_and_process_avatar(avatar)

    # Удаляем старый аватар, если есть
    old_avatar = current_user.avatar_path
    if old_avatar and os.path.exists(f"static{old_avatar}"):
        try:
            os.remove(f"static{old_avatar}")
        except OSError:
            pass  # Игнорируем ошибки удаления

    # Обновляем аватар в БД
    result = await service.update_avatar(current_user.id, avatar_path)

    return result


@router.delete("/profile/avatar")
async def delete_avatar(
        current_user: Annotated[User, Depends(get_current_user)],
        service: Annotated[UserService, Depends(get_user_service)]
):
    """Удалить аватар пользователя"""
    old_avatar = current_user.avatar_path
    if old_avatar:
        # Удаляем файл
        if os.path.exists(f"static{old_avatar}"):
            try:
                os.remove(f"static{old_avatar}")
            except OSError:
                pass

        # Обновляем в БД (устанавливаем None)
        result = await service.update_avatar(current_user.id, None)
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Аватар не найден"
        )

# @router.post("/logout")
# async def logout(
#         current_user: Annotated[User, Depends(get_current_user)],
#         service: Annotated[UserService, Depends(get_user_service)]
# ):
#     """Выход из текущей сессии (аннулирование refresh токена)"""
#     await service.logout_user(current_user.id)
#     return {
#         "message": "Вы успешно вышли из системы"
#     }
