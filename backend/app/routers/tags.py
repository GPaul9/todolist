from typing import List

from fastapi import APIRouter, Depends, status
from app.dependencies import get_current_user, get_tag_service
from app.models.tag import TagCreate, TagUpdate, TagResponseDetailed
from app.models.user import User
from app.services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("", response_model=TagResponseDetailed,
             status_code=status.HTTP_201_CREATED)
async def add_tag(
        tag: TagCreate,
        current_user: User = Depends(get_current_user),
        service: TagService = Depends(get_tag_service),
) -> TagResponseDetailed:
    return await service.create_tag(tag=tag, user_id=current_user.id) # type: ignore


@router.get("", response_model=List[TagResponseDetailed])
async def get_tags(
        current_user: User = Depends(get_current_user),
        service: TagService = Depends(get_tag_service),
) -> List[TagResponseDetailed]:
    return await service.get_all_by_user_id(user_id=current_user.id) # type: ignore


@router.patch("/{tag_id}", response_model=TagResponseDetailed)
async def update_tag(
        tag: TagUpdate,
        tag_id: int,
        current_user: User = Depends(get_current_user),
        service: TagService = Depends(get_tag_service),
) -> TagResponseDetailed:
    return await service.update_tag(
        tag_id=tag_id,
        tag=tag,
        current_user_id=current_user.id, # type: ignore
    )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
        tag_id: int,
        current_user: User = Depends(get_current_user),
        service: TagService = Depends(get_tag_service),
) -> None:
    return await service.delete_tag(tag_id=tag_id, user_id=current_user.id) # type: ignore
