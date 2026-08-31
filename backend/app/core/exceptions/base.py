from typing import Any, Dict, Optional


class AppException(Exception):
    """
    Базовый класс для исключений приложения.
    Позволяет передавать сообщения и дополнительные детали.
    """

    def __init__(
            self,
            message: str,
            status_code: int = 400,
            details: Optional[Dict[str, Any]] = None
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class ContentNotFoundError(AppException):
    """Общая ошибка: ресурс не найден (404)"""

    def __init__(
            self,
            message: str = "Resource not found",
            details: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(message, status_code=404, details=details)


class BadRequestError(AppException):
    """Общая ошибка: неверный запрос (400)"""

    def __init__(
            self,
            message: str = "Bad request",
            details: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(message, status_code=400, details=details)
