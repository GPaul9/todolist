# Подсказки/Заметки

___________

## Поиск и фильтрация

Фильтрация задач по тегам реализуется двумя способами - OR(у задачи есть хотя бы один тег из списка) и AND(у задачи есть
все теги из запроса).

### OR

**Задача** - Вернуть задачи, у которых есть хотя бы один из переданных тегов.

- На входе мы имеем tag_id.
- Необходимо получить задачу, при этом только один раз задачу, без дубликатов, т.е. все её поля - `SELECT DISTINCT t.*`
- Для реализации фильтра нам нужно две таблицы - `tasks` и `tag_task_links`, значит мы их сджоиним.
- В объединенной таблице нужен фильтр по списку - `WHERE ttl.tag_id IN (?)`

Тогда SQL-запрос будет иметь примерно следующий вид:

```sql
SELECT DISTINCT t.*
FROM tasks t
         JOIN tag_task_links AS ttl ON ttl.task_id = t.id
WHERE ttl.tag_id IN (1, 2, 3)
```

### AND

**Задача** - Вернуть задачи, которые имеют все теги из списка.

- На входе мы имеем tag_id.
- Необходимо получить задачу, т.е. все её поля - `SELECT t.*`
- Для реализации фильтра нам нужно две таблицы - `tasks` и `tag_task_links`, значит мы их сджоиним.
- В объединенной таблице нужен фильтр по списку - `WHERE ttl.tag_id IN (?)`
- Отфильтрованную объединенную таблицу нужно разгруппировать на подтаблицы по `task_id` - `GROUP BY t.id`
- Сгруппированные данные нужно отфильтровать так, чтобы остались только те задачи у которых тегов такое же количество
  что и количество тегов во входном списке - `HAVING COUNT(DISTINCT ttl.tag_id) = 3`

Тогда SQL-запрос будет иметь примерно следующий вид:

```sql
SELECT t.*
FROM tasks t
         JOIN tag_task_link ttl ON t.id = ttl.task_id
WHERE ttl.tag_id IN (1, 2, 3)
GROUP BY t.id
HAVING COUNT(DISTINCT ttl.tag_id) = 3;
```

## Настройка окружения

`poetry add -D ...` - флаг `-D`/`-dev` - зависимости для разработки.

`--group dev` - используется в более новых версиях

Это нужно для того, чтобы устанавливать библиотеки только для разработки.
Пакет с таким флагом помещается в специальный раздел файла pyproject.toml — `[tool.poetry.group.dev.dependencies]`

Такие пакеты не нужны для работы самой программы, а нужны только разработчикам.

К таким пакетам, например, относятся:

- Тестирование: pytest, pytest-asyncio, tox
- Линтеры и форматирование: flake8, black, mypy, isort
- Документация: mkdocs, sphinx

Чтобы установить установить только основные пакеты нужно написать: `poetry install --without dev`

## ROUTES

### routes for project

```text
POST   /projects
GET    /projects
GET    /projects/{project_id}
PATCH  /projects/{project_id}
DELETE /projects/{project_id}

PATCH  /projects/{project_id}/archive
PATCH  /projects/{project_id}/unarchive
```

### routes for tasklist

```text
POST   /projects/{project_id}/lists
GET    /projects/{project_id}/lists

GET    /lists/{list_id}
PATCH  /lists/{list_id}
DELETE /lists/{list_id}

PATCH  /lists/{list_id}/archive
PATCH  /lists/{list_id}/unarchive
```

### routes for task

```text
POST   /lists/{list_id}/tasks

GET    /lists/{list_id}/tasks
GET    /lists/{list_id}/tasks?archived=true
GET    /tasks/{task_id}
GET    /tasks - для фильтров и поиска
GET  /tasks?archived=true  (страница архива)

PATCH  /tasks/{task_id}
DELETE /tasks/{task_id}

PATCH   /tasks/{task_id}/archive
PATCH   /tasks/{task_id}/unarchive

DELETE  /tasks/{task_id}           (hard delete)
```

### routes for subtask

```text
POST   /tasks/{task_id}/subtasks
GET    /tasks/{task_id}/subtasks

GET    /subtasks/{subtask_id}
PATCH  /subtasks/{subtask_id}
DELETE /subtasks/{subtask_id}

PATCH   /subtasks/{subtask_id}/archive
PATCH   /subtasks/{subtask_id}/unarchive
```

### routes for tag

```text
POST   /tags
GET    /tags
PATCH  /tags/{tag_id}
DELETE /tags/{tag_id}

POST   /tasks/{task_id}/tags/{tag_id}
DELETE /tasks/{task_id}/tags/{tag_id}
GET    /tasks/{task_id}/tags
```

### routes for attachments

```text
Если вложения принадлежат задаче:
POST   /tasks/{task_id}/attachments
GET    /tasks/{task_id}/attachments

Если вложение — отдельная сущность:
GET    /attachments/{attachment_id}
DELETE /attachments/{attachment_id}

Если поддержка вложений к SubTask:
POST   /subtasks/{subtask_id}/attachments
GET    /subtasks/{subtask_id}/attachments
```

### routes for reminders

```text
Напоминания принадлежат задаче:
POST   /tasks/{task_id}/reminders
GET    /tasks/{task_id}/reminders

Работа с конкретным напоминанием:
PATCH  /reminders/{reminder_id}
DELETE /reminders/{reminder_id}
```

# TODO

- eager loading в репозитории списка задач для сервиса задач.

# S3 storage

```text
1 frontend → backend
   запрос presigned URL

2 backend
   - проверяет размер
   - проверяет лимит файлов
   - генерирует s3_key
   - генерирует upload URL

3 frontend → MinIO
   PUT файл

4 frontend → backend
   confirm upload

5 backend
   INSERT attachment в БД
```

## Settings for s3 storage

Проблема локальной разработки:

Сеть докер контейнеров является изолированной и сама по себе. Это приводит к тому, что
контейнер API не может обратиться к контейнеру minio через хост localhost:9000. Так как этот хост это сам контейнер
API. Поэтому контейнер API должен обращаться к контейнеру minio по его имени - minio:9000.

Но клиент(браузер/постман) ничего не знает про хост minio. Что делать? Либо изменять файл host на компьютере:
`127.0.0.1 minio`, что не является здравой идеей и по сути это костыль. Либо делать два клиента. Что было и сделано.

Один внутренний клиент на хосте - MINIO_INTERNAL_ENDPOINT участвует в инициализации хранилища и внутренних методах типа
проверки того что объект находится в хранилище и удаление из хранилища объекта.

И второй внешний клиент - MINIO_PUBLIC_ENDPOINT. Он участвует в создании и **подписании** ссылки для загрузки объекта в
хранилище.

Конечно может возникнуть вопрос - А почему нельзя создать ссылку с minio, а потом просто заменить на localhost? Логично,
но, но... Ссылка подписывается, а это значит что если подменить что-то, то ссылка уже будет невалидная и ничего не
загрузить.

Тут важен еще момент, что необходимо указать регион, так как если в двух клиентах хосты разные, то MinIO проверяет
регион. А для этого он проходит по хосту localhost. А как мы помним, для контейнера API localhost это он сам. Значит он
обращается сам к себе, чтобы узнать регион хранилища. Но у него нет хранилища и получается ошибка. Поэтому чтобы регион
не проверялся, жестко фиксируем его.

И да, скорее всего если использовать сторонние хранилища, то таких танцев с бубном скорее всего не понадобяться.

# Route for attachment

```text
POST   /attachments/upload-url
POST   /attachments
DELETE /attachments/{id}
GET    /tasks/{id}/attachments
GET    /subtasks/{id}/attachments
```
