from enum import Enum


class TaskStatus(str, Enum):
    TODO = 'todo'
    IN_PROGRESS = 'in_progress'
    DONE = 'done'


class TaskPriority(str, Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'


class SubTaskStatus(str, Enum):
    TODO = 'todo'
    DONE = 'done'


class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED_BY_USER = "archived_by_user"
    ARCHIVED_BY_CASCADE = "archived_by_cascade"


class OrderType(str, Enum):
    ASC = "asc"
    DESC = "desc"


class SortType(str, Enum):
    """Типы сортировки"""
    CREATED_AT = "created_at"  # По дате создания
    TITLE = "title"  # По названию (А-Я)
    UPDATED_AT = "updated_at"  # По активности (последние изменения)


class TaskSortType(str, Enum):
    """Типы сортировки"""
    CREATED_AT = "created_at"  # По дате создания
    TITLE = "title"  # По названию (А-Я)
    DEADLINE = "deadline"  # По активности (последние изменения)

class ListSortType(str, Enum):
    """Типы сортировки списков задач"""
    ORDER = "order"  # По порядку (по умолчанию)



class TaskListStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED_BY_USER = "archived_by_user"
    ARCHIVED_BY_CASCADE = "archived_by_cascade"
    ARCHIVED_BY_USER_AND_CASCADE = "archived_by_user_and_cascade"


class AttachmentParentType(str, Enum):
    task = "task"
    subtask = "subtask"


class ReminderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SENT = "sent"
    CANCELED = "canceled"


class ReminderChannel(str, Enum):
    EMAIL = "email"
    WEBPUSH = "webpush"
    BOTH = "both"
