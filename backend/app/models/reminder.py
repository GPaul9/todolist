from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship, Index
from sqlalchemy import Column, DateTime, text

from app.models.enums import ReminderStatus, ReminderChannel


class Reminder(SQLModel, table=True):
    __tablename__ = "reminders" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)

    status: ReminderStatus = Field(
        default=ReminderStatus.PENDING,
        nullable=False
    )

    reminder_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    reminder_channel: ReminderChannel = Field(
        nullable=False,
        default=ReminderChannel.EMAIL
    )

    task_id: int = Field(foreign_key="tasks.id", nullable=False, ondelete="CASCADE")

    task: Optional["Task"] = Relationship(back_populates="reminders") # type: ignore

    __table_args__ = (
        Index('ix_reminder_status_time', 'status', 'reminder_at'),
        Index(
            'uq_task_pending_reminder_time',
            'task_id',
            'reminder_at',
            unique=True,
            postgresql_where=text("status = 'PENDING'")
        ),
    )


class ReminderCreate(SQLModel):
    reminder_at: datetime
    # reminder_channel: ReminderChannel = ReminderChannel.EMAIL


class ReminderUpdate(SQLModel):
    reminder_at: Optional[datetime]
    # reminder_channel: Optional[ReminderChannel] = None

    task_id: Optional[int]


class ReminderResponse(SQLModel):
    id: int
    status: ReminderStatus

    reminder_at: datetime
    # reminder_channel: ReminderChannel

    task_id: int


class ReminderWithTaskResponse(SQLModel):
    reminder: ReminderResponse
    task: "TaskResponse" # type: ignore