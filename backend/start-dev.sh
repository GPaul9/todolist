#!/bin/bash
echo "========================================"
echo "    FastAPI Todolist - Docker Build     "
echo "========================================"

echo "[1/4] Остановка предыдущих контейнеров..."
docker compose down --remove-orphans

echo -e "\n[2/4] Очистка старых образов..."
docker compose build --no-cache

echo -e "\n[3/4] Создание сети и запуск сервисов..."
docker compose up -d postgres redis

echo -e "\n[4/4] Запуск FastAPI приложения..."
docker compose up -d api

echo -e "\n========================================"
echo "✅ Сборка завершена успешно!"
echo "========================================"

echo -e "\nСтатус контейнеров:"
docker compose ps

echo -e "\nЛоги API (Ctrl+C для выхода):"
docker compose logs -f api

