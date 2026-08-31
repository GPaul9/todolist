from datetime import datetime
from typing import Optional, List, TypeVar, Generic

from sqlalchemy import DateTime, func, ForeignKey
from sqlmodel import SQLModel, Field, Relationship, Column
from app.models.enums import TaskListStatus


class TaskList(SQLModel, table=True):
    __tablename__ = "task_lists"  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)

    title: str = Field(
        min_length=3,
        max_length=100,
        nullable=False,
    )

    order: int = Field(default=0, index=True)

    status: TaskListStatus = Field(default=TaskListStatus.ACTIVE, nullable=False)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow)

    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            onupdate=func.now()
        )
    )

    project_id: int = Field(
        sa_column=Column(
            ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False
        )
    )

    project: Optional["Project"] = Relationship(back_populates="lists")  # type: ignore
    tasks: List["Task"] = Relationship(
        back_populates="task_list",
        sa_relationship_kwargs={
            "passive_deletes": True,
            "cascade": "all, delete-orphan"
        },
    )

    async def touch(self):
        """Обновить timestamp при изменении"""
        self.updated_at = datetime.utcnow()


# ===== SCHEMA TASK LIST =====
class TaskListCreate(SQLModel):
    title: str = Field(min_length=3, max_length=100)
    status: TaskListStatus = TaskListStatus.ACTIVE


class TaskListUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=100)
    order: Optional[int] = Field(default=None, ge=0)
    status: Optional[TaskListStatus] = None


class TaskListRead(SQLModel):
    id: int
    title: str
    order: int
    status: TaskListStatus
    created_at: datetime
    project_id: int


# class ListRead(TaskListRead):
#     total_tasks: int = 0
#     completed_tasks: int = 0

class TaskListReorder(SQLModel):
    project_id: int
    ordered_ids: List[int] = Field(..., min_length=1)
