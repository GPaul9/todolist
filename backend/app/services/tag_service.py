from typing import List

from sqlalchemy.exc import IntegrityError

from app.core.exceptions.tag import TagNotFoundError, TagAlreadyExistsError
from app.models.tag import Tag, TagCreate, TagResponseDetailed, TagUpdate
from app.repositories.tag_repo import TagRepository


class TagService:
    """Сервис для работы с тегами"""

    def __init__(self, repo: TagRepository):
        self.repo = repo
    
    async def _build_response(self, tag: Tag, count: int) -> TagResponseDetailed:
        return TagResponseDetailed(
            id=tag.id, # type: ignore
            name=tag.name,
            color=tag.color,
            task_count=count,
        )


    async def create_tag(
            self,
            tag: TagCreate,
            user_id: int
    ) -> TagResponseDetailed:
        """Создание тега"""
        existing = await self.repo.get_by_name_and_user(
            tag_name=tag.name,
            user_id=user_id,
        )
        if existing:
            raise TagAlreadyExistsError(tag.name)

        tag_data = tag.model_dump()
        db_tag = Tag(
            **tag_data,
            user_id=user_id,
        )

        tag_create = await self.repo.create(db_tag)

        return await self._build_response(tag_create, 0)

    async def get_all_by_user_id(
            self,
            user_id: int
    ) -> List[TagResponseDetailed]:
        """Получить все теги пользователя"""
        result = await self.repo.get_all_by_user(user_id)
        return [
            await self._build_response(tag, count)
            for tag, count in result
        ]

    async def update_tag(
            self,
            tag_id: int,
            tag: TagUpdate,
            current_user_id: int
    ) -> TagResponseDetailed:
        """Обновить тег"""
        result = await self.repo.get_by_id(tag_id, current_user_id)
        if not result:
            raise TagNotFoundError(tag_id)

        db_tag, task_count = result

        update_data = tag.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tag, field, value)

        try:
            updated_tag = await self.repo.update(db_tag)

            return await self._build_response(updated_tag, task_count)
        except IntegrityError:
            raise TagAlreadyExistsError(tag.name) # type: ignore

    async def delete_tag(
            self,
            tag_id: int,
            user_id: int
    ) -> None:
        """Удаление тега по его ID"""
        result = await self.repo.get_by_id(tag_id, user_id)
        if not result:
            raise TagNotFoundError(tag_id)
        
        tag, _ = result

        await self.repo.delete(tag)
