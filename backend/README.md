
# TODOLIST Backend

**TODOLIST Backend** — REST API для полнофункционального личного таск-трекера с иерархической структурой (Проекты → Списки → Задачи → Подзадачи), JWT авторизацией, Celery задачами, MinIO S3 хранением и мощной системой поиска/фильтрации.

## 🏷️ Название проекта

**TODOLIST Backend** — FastAPI REST API для личного таск-трекера

## 📝 Описание

TODOLIST — это современный таск-трекер для индивидуальных пользователей (разработчиков, PM, фрилансеров), который позволяет:

```
📂 Организовывать задачи по Проектам → Спискам → Задачам → Подзадачам
🔔 Получать напоминания через email/WebPush (Celery Beat)
📎 Прикреплять файлы через presigned S3 URL (MinIO)
🔍 Искать и фильтровать по дате/статусу/тегам
🏷️ Использовать цветные теги с автокомплитом
📊 Отслеживать прогресс по подзадачам
```

**Отличия от Todoist/Notion:**

- ✅ Self-hosted (Docker Compose)
- ✅ Полная кастомизация (open source)
- ✅ Мощная иерархия задач
- ✅ S3/MinIO файлы без лимитов


## 🏅 Badges

[
[
[
[
[

## 🖼️ Visuals

```
[Здесь будут скриншоты Swagger UI, архитектуры БД, Docker Compose]
[Архитектурная схема ERD проекта]
[GIF демонстрация создания задачи с вложениями]
```


## 📦 Установка

### Предварительные требования

```bash
# Docker + Docker Compose (рекомендуется)
docker --version  # 24+
docker compose version  # v2.28+

# Poetry (локальная разработка)
curl -sSL https://install.python-poetry.org | python3 -
```


### 🚀 Быстрый старт (Docker)

```bash
git clone https://gitlab.pointpulse.ru/l1/todolist/backend.git
cd backend
cp .env.example .env
docker compose up --build -d

# Проверка
curl http://localhost:8000/health
# ✅ {"status": "healthy"}
```


### 🛠 Локальная разработка

```bash
# Установка
poetry install --with dev,test,celery

# Миграции БД
poetry run alembic upgrade head

# Запуск (3 терминала)
poetry run uvicorn app.main:app --reload        # API:8000
poetry run celery -A app.workers worker -l info # Worker
poetry run celery -A app.workers beat -l info   # Scheduler
```

**Доступ:**

- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- MinIO: http://localhost:9001 (minioadmin/minioadmin)


## 💻 Использование

### 🔐 Регистрация

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass12!@"
  }'
```


### 📝 Создание проекта

```bash
curl -X POST "http://localhost:8000/projects/" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Рабочие задачи", "description": "Спринт 1"}'
```


### ✅ API Документация

Полная Swagger документация доступна по адресу: **http://localhost:8000/docs**

## 💬 Поддержка

| Тип | Ссылка |
| :-- | :-- |
| 🐛 Issues | [GitLab Issues](https://gitlab.pointpulse.ru/l1/todolist/backend/-/issues) |
| 💬 Обсуждения | [GitLab Discussions](https://gitlab.pointpulse.ru/l1/todolist/backend/-/discussions) |
| 📧 Email | backend@todolist.ru |

## 🗺️ Roadmap

### v1.0 (Февраль 2026) ✅

- [x] CRUD: User/Project/List/Task/Subtask
- [x] JWT + OAuth2 (Google/GitLab)
- [x] Celery reminders (email)
- [x] MinIO S3 presigned URLs
- [x] Поиск/фильтры/теги


### v1.1 (Март 2026)

- [ ] WebPush уведомления
- [ ] iCal/Google Calendar экспорт
- [ ] Drag-n-drop API


### v2.0 (Июнь 2026)

- [ ] Ролевая ACL (Owner/Editor/Viewer)
- [ ] Telegram Bot
- [ ] Реальное время (WebSocket)


## 🤝 Contributing

### Стандартный workflow

```bash
# 1. Форк + клонирование
git clone https://gitlab.pointpulse.ru/l1/todolist/backend.git
cd backend
poetry install --with dev,test

# 2. Фичевые ветки
git checkout -b feature/task-priority

# 3. Тесты + линтинг
poetry run pre-commit install
poetry run pytest --cov=app
poetry run black --check .
poetry run ruff check .

# 4. Push + MR
git push origin feature/task-priority
```


### Требования к коду

```
✅ Черный код (black)
✅ Типизация (mypy strict)
✅ 80%+ покрытие тестами
✅ Pydantic валидация
✅ SQLModel модели
✅ Документация docstring
```


## 👥 Авторы и благодарности

| Роль | Автор | Контрибьюторы |
| :-- | :-- | :-- |
| 🏗️ Архитектура | Backend Developer | - |
| 🧪 Тестирование | QA Engineer | - |
| 📚 Документация | Technical Writer | - |

## 📄 Лицензия

[

Этот проект распространяется под лицензией **MIT**. Используйте на здоровье!

## 📈 Статус проекта

**✅ Активная разработка**

- Еженедельные релизы
- CI/CD pipeline
- 95%+ тест покрытие
- Docker production-ready

***

**Сделано с ❤️ для демонстрации современных практик backend разработки**
**Февраль 2026**
