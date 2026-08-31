from datetime import datetime, timezone
from typing import Optional, List
from pydantic import model_validator
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, Relationship, SQLModel

from .base import BaseTask
from .enums import TaskStatus, TaskPriority, TaskSortType, OrderType
from .tag import Tag, TagResponseShort
from .tag_task_link import TagTaskLink


class Task(BaseTask, table=True):
    __tablename__ = 'tasks'  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    status: TaskStatus = Field(default=TaskStatus.TODO, nullable=False)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, nullable=False)

    position: float = Field(default=0.0, nullable=False, index=True)
    progress: int = Field(default=0, ge=0, le=100)

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

    task_list_id: int = Field(
        nullable=False, 
        foreign_key='task_lists.id', 
        ondelete="CASCADE"
        )

    task_list: Optional["TaskList"] = Relationship(back_populates='tasks')  # type: ignore[name-defined]
    subtasks: List["SubTask"] = Relationship(back_populates='task', cascade_delete=True)  # type: ignore[name-defined]
    tags: List["Tag"] = Relationship(back_populates='tasks', link_model=TagTaskLink)
    reminders: List["Reminder"] = Relationship(back_populates='task', cascade_delete=True)  # type: ignore


class TaskCreate(BaseTask):
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM

    # @model_validator(mode="after")
    # def validate_deadline_in_future(self):
    #     if self.deadline and self.deadline <= datetime.now(timezone.utc):
    #         raise ValueError("Deadline must be in the future")
    #     return self
    


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(min_length=3, max_length=150, default=None)
    description: Optional[str] = Field(max_length=2000, default=None)

    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    deadline: Optional[datetime] = None

    # @model_validator(mode="after")
    # def validate_deadline_in_future(self):
    #     if self.deadline and self.deadline <= datetime.now(timezone.utc):
    #         raise ValueError("Deadline must be in the future")
    #     return self


class TaskReorder(SQLModel):
    new_task_list_id: Optional[int] = None


class TaskResponse(BaseTask):
    id: int
    status: TaskStatus
    priority: TaskPriority
    progress: int
    task_list_id: int

    created_at: datetime
    updated_at: datetime

    archived_at: Optional[datetime]
    total_subtasks: int = 0
    completed_subtasks: int = 0
    is_archived: bool

    tags: List["TagResponseShort"] = []
    total_attachments: int = 0
    total_reminders: int = 0


class TaskSearchParams(SQLModel):
    # Search and filters
    search: Optional[str] = None
    status: Optional[list[TaskStatus]] = None
    priority: Optional[list[TaskPriority]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    tags_ids: Optional[list[int]] = None
    match_all_tags: bool = False

    # Sort
    sort_by: TaskSortType = TaskSortType.CREATED_AT
    order: OrderType = OrderType.DESC

    # Pagination
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)

    archived: bool = False
