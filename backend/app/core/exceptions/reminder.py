from app.core.exceptions.base import AppException


class ReminderTaskNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            message="Task not found",
            status_code=404
        )

class ReminderTaskAlreadyDoneError(AppException):
    def __init__(self):
        super().__init__(
            message="Task already done",
            status_code=400
        )

class ReminderNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            message="Reminder not found",
            status_code=404
        )

class ReminderFutureError(AppException):
    def __init__(self):
        super().__init__(
            message="Reminder must be set in the future",
            status_code=400
        )

class ReminderCompleteTaskError(AppException):
    def __init__(self):
        super().__init__(
            message="Cannot add reminder to completed task",
            status_code=400
        )

class ReminderCountError(AppException):
    def __init__(self):
        super().__init__(
            message="Count of reminders must be equal or less than 5",
            status_code=400
        )

class ReminderPendingError(AppException):
    def __init__(self):
        super().__init__(
            message="Only pending reminders can be updated",
            status_code=400
        )

class ReminderArchivedTaskError(AppException):
    def __init__(self):
        super().__init__(
            message="Cannot modify reminder in archived task",
            status_code=400
        )

class ReminderDuplicateError(AppException):
    def __init__(self):
        super().__init__(
            message="Reminder with this time already exists",
            status_code=400
        )
