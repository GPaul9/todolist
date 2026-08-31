from typing import List

from app.models.enums import SubTaskStatus
from app.models.subtask import SubTask
from app.repositories.subtask_repo import SubTaskRepository
from app.repositories.task_repo import TaskRepository


class TaskProgressService:
    def __init__(self,
                 task_repo: TaskRepository,
                 subtask_repo: SubTaskRepository):
        self.task_repo = task_repo
        self.subtask_repo = subtask_repo

    async def recalc(self, task_id: int, user_id: int) -> None:
        subtasks: List[SubTask] = await self.subtask_repo.get_by_task_id(task_id)

        if not subtasks:
            progress = 0
        else:
            done = sum(
                1 for subtask in subtasks if
                (subtask.status == SubTaskStatus.DONE and subtask.is_archived == False))
            progress = int(done / len(subtasks) * 100)

        await self.task_repo.update_progress(task_id, progress)
