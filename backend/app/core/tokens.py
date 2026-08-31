import secrets


def generate_confirmation_token() -> str:
    """Генерирует случайный токен подтверждения (32 символа)."""
    return secrets.token_urlsafe(32)
