from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import delete, select

from app.models.webpush import WebPushSubscription

class WebPushRepository:

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, webpush: WebPushSubscription)-> WebPushSubscription:
        self.session.add(webpush)
        await self.session.commit()
        await self.session.refresh(webpush)
        return webpush
    
    async def get_by_user_id(self, user_id: int) -> List[WebPushSubscription]:
        stmt = (
            select(WebPushSubscription)
            .where(WebPushSubscription.user_id == user_id)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars())
    
    async def delete(self, webpush: WebPushSubscription) -> None:
        await self.session.delete(webpush)
        await self.session.commit()
        
    async def get_by_endpoint(self, endpoint: str) -> Optional[WebPushSubscription]:
        stmt = select(WebPushSubscription).where(
            WebPushSubscription.endpoint == endpoint
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_by_ids(self, subscription_ids: list[int]) -> None:
        stmt = (
            delete(WebPushSubscription)
            .where(
                WebPushSubscription.id.in_(subscription_ids)
            )
        )
        await self.session.execute(stmt)
        await self.session.commit()
