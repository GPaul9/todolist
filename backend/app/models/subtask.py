from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, DateTime, ForeignKey, func
from sqlmodel import Field, Relationship, SQLModel

from app.models.attachment import AttachmentResponse
from app.models.base import BaseSubTask
from app.models.enums import SubTaskStatus
from app.models.task import TaskResponse


class SubTask(BaseSubTask, table=True):
    __tablename__ = 'subtasks' # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    status: SubTaskStatus = Field(default=SubTaskStatus.TODO, nullable=False)
    position: int = Field(default=0, nullable=False)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            onupdate=lambda: datetime.now(timezone.utc),
        ),
        default_factory=lambda: datetime.now(timezone.utc),
    )

    is_archived: bool = Field(default=False, nullable=False)
    archived_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default=None
    )

    task_id: int = Field(
        foreign_key="tasks.id", 
        ondelete="CASCADE",
        nullable=False
        )

    task: Optional["Task"] = Relationship(back_populates="subtasks")  # type: ignore[name-defined]


class SubTaskCreate(BaseSubTask):
    status: SubTaskStatus = SubTaskStatus.TODO
    # position: int = 0


class SubTaskUpdate(BaseSubTask):
    title: Optional[str] = None # type: ignore
    description: Optional[str] = None
    status: Optional[SubTaskStatus] = None
    position: Optional[int] = None
    is_archived: Optional[bool] = Field(default=False)
    archived_at: Optional[datetime] = Field(default=None)


class SubTaskResponse(BaseSubTask):
    id: int
    status: SubTaskStatus
    position: int

    task_id: int

    created_at: datetime
    updated_at: datetime
    is_archived: bool

    # is_archived: bool
    archived_at: Optional[datetime]
    attachments: List["AttachmentResponse"] = []

    class ConfigDict:
        from_attributes = True


class SubTaskWithTaskResponse(SQLModel):
    subtask: SubTaskResponse
    task: Optional["TaskResponse"] = None
