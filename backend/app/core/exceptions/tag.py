from app.core.exceptions.base import AppException
from app.core.config import settings

class TagNotFoundError(AppException):
    """Тег не найден"""

    def __init__(self, tag_id: int):
        super().__init__(
            message=f"Tag {tag_id} not found",
            status_code=404
        )


class TagAlreadyExistsError(AppException):
    """Выбрасывается при дублировании имени тега (статус 400)"""

    def __init__(self, name: str):
        super().__init__(
            message=f"Tag '{name}' already exists",
            status_code=400
        )

class TagColorError(AppException):
    def __init__(self):
        super().__init__(
            message=f"Color must be one of: {sorted(settings.ALLOWED_COLORS)}", 
            status_code=422
            )
