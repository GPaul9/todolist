# Базовый образ с Python 3.12 (slim для меньшего размера)
FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости для PostgreSQL и компиляции пакетов
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Копируем файл зависимостей и устанавливаем их (кешируется Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем исходный код приложения
COPY . .

RUN mkdir -p /app/static/avatars && \
    chmod -R 755 /app/static

# Создаем не-root пользователя для безопасности
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app

# ПЕРЕДАЁМ ПРАВА ВЛАДЕЛЬЦА НА static-ПАПКУ
# Важно: делаем это ПОСЛЕ chown, чтобы appuser мог записывать файлы
RUN chown -R appuser:appuser /app/static/avatars && \
    chmod 755 /app/static/avatars

USER appuser

# Открываем порт для FastAPI
EXPOSE 8000

# Healthcheck для API контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
