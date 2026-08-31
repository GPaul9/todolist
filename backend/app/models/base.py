from datetime import datetime

from pydantic import field_validator
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel
from typing import Optional, Generic, TypeVar, List


class BaseTask(SQLModel):
    title: str = Field(min_length=3, max_length=150, nullable=False)
    description: Optional[str] = Field(max_length=2000, default=None)
    deadline: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default=None
    )

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v
    
    @field_validator('description', mode='before')
    @classmethod
    def strip_description(cls, v: str) -> Optional[str]:
        if isinstance(v, str):
            return v.strip()
        return v


class BaseSubTask(SQLModel):
    title: str = Field(min_length=3, max_length=100, nullable=False)
    description: Optional[str] = Field(max_length=2000, default=None)

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v
    
    @field_validator('description', mode='before')
    @classmethod
    def strip_description(cls, v: str) -> Optional[str]:
        if isinstance(v, str):
            return v.strip()
        return v


T = TypeVar("T")


class PageMeta(SQLModel):
    currentPage: int
    totalPages: int
    hasNextPage: bool
    totalCount: int


class Page(SQLModel, Generic[T]):
    data: List[T]
    meta: PageMeta
