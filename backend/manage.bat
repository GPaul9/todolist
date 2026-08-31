@echo off
chcp 65001 >nul
cls

:menu
echo ========================================
echo        Управление проектом
echo ========================================
echo 1. Сборка и запуск (build ^& up)
echo 2. Запуск (up)
echo 3. Пересборка (rebuild)
echo 4. Остановить (down)
echo 5. Логи API
echo 6. Логи БД
echo 7. Очистить всё (down -v)
echo 8. Статус контейнеров
echo 0. Выход
echo ========================================
set /p choice="Выбор: "

if "%choice%"=="1" (
    call :build_up
    goto :menu
)
if "%choice%"=="2" (
    docker compose up -d
    goto :menu
)
if "%choice%"=="3" (
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    goto :menu
)
if "%choice%"=="4" (
    docker compose down
    goto :menu
)
if "%choice%"=="5" (
    docker compose logs -f api
    goto :menu
)
if "%choice%"=="6" (
    docker compose logs -f db
    goto :menu
)
if "%choice%"=="7" (
    docker compose down -v --remove-orphans
    docker system prune -f
    goto :menu
)
if "%choice%"=="8" (
    docker compose ps
    goto :menu
)
goto :menu

:build_up
docker compose down -v --remove-orphans
docker compose build --no-cache
docker compose up -d postgres redis
timeout /t 30 /nobreak >nul
docker compose up -d api
docker compose ps
exit /b

echo Нажмите любую клавишу...
pause >nul
