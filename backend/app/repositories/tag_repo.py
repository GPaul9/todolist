from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy import func

from app.models import TagTaskLink
from app.models.tag import Tag


class TagRepository:
    """Ассинхронный репозиторий для работы с тегами"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, tag: Tag) -> Tag:
        """Создание нового тега"""
        self.session.add(tag)
        await self.session.commit()
        await self.session.refresh(tag)
        return tag

    async def get_by_id(self, tag_id: int, user_id: int) -> Optional[Tuple[Tag, int]]:
        """Получение тега по ID и подсчитать количество привязанных задач"""
        stmt = (
            select(Tag, func.count(TagTaskLink.task_id).label('task_count')) # type: ignore
            .where(Tag.id == tag_id, Tag.user_id == user_id)
            .join(TagTaskLink, isouter=True)
            .group_by(Tag.id) # type: ignore
        )
        result = await self.session.execute(stmt)
        return result.tuples().first() # type: ignore

    async def get_by_name_and_user(self, tag_name: str, user_id: int) -> Optional[Tag]:
        """Получение тега по его названию и ID пользователя"""
        stmt = (
            select(Tag)
            .where(Tag.name == tag_name, Tag.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_by_user(self, user_id: int) -> List[Tuple[Tag, int]]:
        """Получение всех тегов пользователя с количеством задач"""
        stmt = (
            select(
                Tag,
                func.count(TagTaskLink.task_id).label('task_count') # type: ignore
            )
            .where(Tag.user_id == user_id)
            .join(TagTaskLink, isouter=True)
            .group_by(Tag.id) # type: ignore
        )
        result = await self.session.execute(stmt)
        return list(result.all()) # type: ignore

    async def update(self, tag: Tag) -> Tag:
        """Обновление существующего тега"""
        self.session.add(tag)
        await self.session.commit()
        await self.session.refresh(tag)
        return tag

    async def delete(self, tag: Tag) -> None:
        """Удаление тега"""
        await self.session.delete(tag)
        await self.session.commit()
