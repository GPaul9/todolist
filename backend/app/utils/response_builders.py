
from app.models.task import Task, TaskResponse


def build_task_response(
        task:Task,
        total_subtasks: int = 0,
        completed_subtasks: int = 0,
        total_attachments: int = 0,
        total_reminders: int = 0,
    ) -> TaskResponse:
    task_response = TaskResponse.model_validate(task)
    task_response.total_subtasks = total_subtasks
    task_response.completed_subtasks = completed_subtasks
    task_response.total_attachments = total_attachments
    task_response.total_reminders = total_reminders
    return task_response
