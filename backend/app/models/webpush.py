from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field


class WebPushSubscription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False)

    endpoint: str = Field(unique=True, max_length=500)
    p256dh: str
    auth: str
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc)
        )
    
    # expiration_at: Optional[datetime] = None
    # browser: Optional[str] = None
    # device_name: Optional[str] = None    

class WebPushKeys(SQLModel):
    p256dh: str
    auth: str

class WebPushSubscriptionCreate(SQLModel):
    endpoint: str = Field(..., max_length=500)
    keys: WebPushKeys 

class WebPushSubscriptionResponse(SQLModel):
    id: int
    endpoint: str
    created_at: datetime

    