from app.core.exceptions.base import AppException


class TaskNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            message="Task not found",
            status_code=404
        )


class TaskListNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            message="TaskList not found",
            status_code=404
        )


class TaskProjectArchivedError(AppException):
    def __init__(self):
        super().__init__(
            message="Cannot modify task in archived project",
            status_code=400
        )

class TaskListArchivedError(AppException):
    def __init__(self):
        super().__init__(
            message="Cannot modify task in archived tasklist",
            status_code=400
        )

class TaskArchivedError(AppException):
    def __init__(self):
        super().__init__(
            message="Cannot modify archived task",
            status_code=400
        )

class TaskTagLimitError(AppException):
    def __init__(self):
        super().__init__(
            message="Tag limit reached (max 25)",
            status_code=400
        )

class TaskTagAlreadyExistsError(AppException):
    def __init__(self):
        super().__init__(
            message="Tag already added to this task",
            status_code=400
        )

class TaskTagNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            message="Tag link not found",
            status_code=404
        )

class ProjectNotOwnerError(AppException):
    def __init__(self):
        super().__init__(
            message="Project owner not allowed",
            status_code=403
        )

class TaskAlreadyInTaskListError(AppException):
    def __init__(self):
        super().__init__(
            message="Task already in this TaskList",
            status_code=400
        )