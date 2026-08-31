from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from pydantic import field_validator
from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field

from app.core.constants import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPE, MAX_FILE_SIZE
from app.core.exceptions.attachment import AttachmentSizeError

from .enums import AttachmentParentType


class Attachment(SQLModel, table=True):
    __tablename__ = "attachments"  # type: ignore

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    original_filename: str
    size: int
    mime_type: str

    s3_key: str = Field(index=True, unique=True)

    parent_type: AttachmentParentType = Field(index=True)
    parent_id: int = Field(index=True)

    uploaded_by: int = Field(
        foreign_key="user.id",
        ondelete="CASCADE",
    )

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    confirmed_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
        default=None
    )


class AttachmentCreate(SQLModel):
    original_filename: str = Field(min_length=1)
    size: int = Field(gt=0)
    mime_type: str

    parent_type: AttachmentParentType
    parent_id: int = Field(gt=0)

    @field_validator("original_filename")
    @classmethod
    def validate_filename(cls, v:str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Filename cannot be empty")
        if len(v) > 255:
            raise ValueError("Filename too long")
        
        if "." not in v:
            raise ValueError("Filename must have extension")
        
        name_part, ext_part = v.rsplit(".", 1)
        if not name_part:
            raise ValueError("File must have filename before extension")
        if ext_part.lower() not in ALLOWED_EXTENSIONS:
            raise ValueError("Extansion is not allowed")
        
        return v


    @field_validator("size")
    @classmethod
    def validate_size(cls, v:int) -> int:
        if v > MAX_FILE_SIZE:
            raise AttachmentSizeError()
        return v

    @field_validator("mime_type")
    @classmethod
    def validate_mime_type(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("MIME-type is required")
        if v not in ALLOWED_MIME_TYPE:
            raise ValueError("MIME-type is not allowed")
        return v

class AttachmentUpload(AttachmentCreate):
    s3_key: str = Field(min_length=1)


class AttachmentResponse(SQLModel):
    id: UUID
    original_filename: str
    size: int
    mime_type: str
    s3_key: str
    parent_type: AttachmentParentType


class AttachmentWithTaskResponse(SQLModel):
    attachment: AttachmentResponse
    task: "TaskResponse" # type: ignore


class AttachmentWithSubTaskResponse(SQLModel):
    attachment: AttachmentResponse
    subtask: "SubTaskResponse" # type: ignore
    task: "TaskResponse" # type: ignore
