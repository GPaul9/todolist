@echo off
REM FastAPI Todolist - Docker Compose пакетный файл для Windows
REM Сборка, запуск и управление проектом

title FastAPI Todolist Docker Build
chcp 65001 >nul
cls

echo ========================================
echo     FastAPI Todolist - Docker Build
echo ========================================
echo.

REM Проверка Docker Desktop
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker не установлен или не запущен!
    echo Запустите Docker Desktop и попробуйте снова.
    pause
    exit /b 1
)

REM Проверка docker-compose
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Используется устаревший docker-compose
)

echo [1/5] Остановка предыдущих контейнеров...
docker compose down -v --remove-orphans

echo.
echo [2/5] Очистка старых образов...
docker compose build --no-cache --progress=plain

echo.
echo [3/5] Создание сети и запуск сервисов...
docker compose up -d postgres redis

echo.
echo [4/5] Ожидание готовности БД (30 сек)...
timeout /t 30 /nobreak >nul

echo.
echo [5/5] Запуск FastAPI приложения...
docker compose up -d api

echo.
echo ========================================
echo ✅ Сборка завершена успешно!
echo ========================================
echo.
echo Статус контейнеров:
docker compose ps
echo.
echo Логи API (Ctrl+C для выхода):
docker compose logs -f api
echo.
pause
