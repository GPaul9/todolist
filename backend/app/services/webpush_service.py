from typing import List, Optional

from app.models.user import User
from app.models.webpush import WebPushSubscriptionResponse, \
    WebPushSubscriptionCreate, WebPushSubscription
from app.repositories.webpush_repo import WebPushRepository


class WebPushService:

    def __init__(
            self,
            webpush_repo: WebPushRepository
    ):
        self.webpush_repo = webpush_repo

    async def register_subscription(
            self,
            webpush_create: WebPushSubscriptionCreate,
            current_user: User
    ) -> WebPushSubscriptionResponse:
        existing = await self.webpush_repo.get_by_endpoint(webpush_create.endpoint)
        if existing:
            return WebPushSubscriptionResponse.model_validate(existing)

        webpush_db = WebPushSubscription(
            user_id=current_user.id,  # type: ignore
            endpoint=webpush_create.endpoint,
            p256dh=webpush_create.keys.p256dh,
            auth=webpush_create.keys.auth
        )

        subscription = await self.webpush_repo.create(webpush_db)
        return WebPushSubscriptionResponse.model_validate(subscription)

    async def get_subscriptions_by_user(
            self,
            current_user: User
    ) -> List[WebPushSubscriptionResponse]:
        results = await self.webpush_repo.get_by_user_id(current_user.id)  # type: ignore

        return [WebPushSubscriptionResponse.model_validate(sub) for sub in results]
