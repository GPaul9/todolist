from typing import Optional
from sqlmodel import SQLModel, Field


class TagTaskLink(SQLModel, table=True):
    __tablename__ = "tag_task_link" # type: ignore

    tag_id: Optional[int] = Field(default=None, foreign_key="tags.id", primary_key=True)
    task_id: Optional[int] = Field(default=None, foreign_key="tasks.id", primary_key=True)
