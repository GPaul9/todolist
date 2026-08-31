from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_current_user, get_webpush_service
from app.models.user import User
from app.models.webpush import WebPushSubscriptionResponse, WebPushSubscriptionCreate
from app.services.webpush_service import WebPushService
from app.core.config import settings

router = APIRouter(tags=["webpush"])


@router.get("/webpush/vapid-public-key")
async def get_vapid_public_key():
    return {"public_key": settings.VAPID_PUBLIC_KEY}


@router.post("/webpush/register",
             response_model=WebPushSubscriptionResponse,
             summary="Регистрация браузера пользователя в бд"
             )
async def register_webpush(
        webpush_create: WebPushSubscriptionCreate,
        current_user: User = Depends(get_current_user),
        service: WebPushService = Depends(get_webpush_service)
) -> WebPushSubscriptionResponse:
    try:
        return await service.register_subscription(
            webpush_create,
            current_user
        )
    except ValueError as err:
        raise HTTPException(status_code=400,
                            detail=str(err))


@router.get("/webpush",
            response_model=List[WebPushSubscriptionResponse],
            summary="Выдает все подписки пользователя"
            )
async def get_subscriptions_by_user(
        current_user: User = Depends(get_current_user),
        service: WebPushService = Depends(get_webpush_service)
) -> List[WebPushSubscriptionResponse]:
    return await service.get_subscriptions_by_user(current_user=current_user)
