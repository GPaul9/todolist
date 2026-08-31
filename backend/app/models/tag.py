from typing import Optional, List
from pydantic import field_validator
from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import CITEXT
from sqlmodel import SQLModel, Field, Relationship
from app.core.exceptions.tag import TagColorError
from app.models.tag_task_link import TagTaskLink
from app.models.user import User
from app.core.config import settings


class Tag(SQLModel, table=True):
    __tablename__ = "tags" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(
        sa_type=CITEXT,
        min_length=1,
        max_length=30,
        nullable=False
    )
    color: str = Field(max_length=7)
    user_id: int = Field(nullable=False, foreign_key='user.id', ondelete="CASCADE")

    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TagTaskLink)  # type: ignore[name-defined]
    user: Optional["User"] = Relationship(back_populates="tags")

    __table_args__ = (
        UniqueConstraint('name', 'user_id'),
    )


class TagCreate(SQLModel):
    name: str = Field(min_length=1, max_length=30)
    color: str
    
    @field_validator('name', mode='before')
    @classmethod
    def strip_name(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator('color')
    @classmethod
    def validate_color(cls, value: str):
        if value not in settings.ALLOWED_COLORS:
            raise TagColorError()
        return value


class TagUpdate(SQLModel):
    name: Optional[str] = Field(min_length=1, max_length=30, default=None)
    color: Optional[str] = Field(max_length=7, default=None)

    @field_validator('name', mode='before')
    @classmethod
    def strip_name(cls, v: str) -> Optional[str]:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator('color')
    @classmethod
    def validate_color(cls, value: str) -> Optional[str]:
        if value not in settings.ALLOWED_COLORS:
            raise TagColorError()
        return value


class TagResponseShort(SQLModel):
    id: int
    name: str
    color: str


class TagResponseDetailed(TagResponseShort):
    task_count: int
