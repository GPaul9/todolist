from enum import Enum
from typing import Optional
from sqlalchemy import Column, DateTime, func
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from app.models.enums import ProjectStatus

from typing import Generic, TypeVar, List


class Project(SQLModel, table=True):
    __tablename__ = "projects"  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)

    title: str = Field(
        min_length=3,
        max_length=100,
        nullable=False,
        index=True,
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
    )
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE, nullable=False)

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

    archived_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=True,
        )
    )

    owner_id: int = Field(foreign_key="user.id")

    owner: Optional["User"] = Relationship(back_populates="projects")  # type: ignore

    lists: List["TaskList"] = Relationship(back_populates="project",
                                           sa_relationship_kwargs={"passive_deletes": True, "cascade": "all, delete-orphan"}, )  # type: ignore

    async def touch(self):
        """Обновить timestamp при изменении"""
        self.updated_at = datetime.utcnow()


# ===== SCHEMA PROJECT =====
class ProjectCreate(SQLModel):
    title: str = Field(min_length=3, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: ProjectStatus = ProjectStatus.ACTIVE  # лучше сделать через default


class ProjectUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[ProjectStatus] = None


class ProjectRead(SQLModel):
    id: int
    title: str
    description: Optional[str]
    status: ProjectStatus
    created_at: datetime

    total_tasks: int = 0
    completed_tasks: int = 0
