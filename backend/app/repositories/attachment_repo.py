from typing import Optional, List
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from app.models.attachment import Attachment
from app.models.enums import AttachmentParentType


class AttachmentRepository:
    """Асинхронный репозиторий для работы с вложениями"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, attachment: Attachment) -> Attachment:
        """Создание вложения"""
        self.session.add(attachment)
        await self.session.commit()
        await self.session.refresh(attachment)
        return attachment

    async def get_by_parent(
            self,
            parent: AttachmentParentType,
            parent_id: int,
            user_id: int
    ) -> List[Attachment]:
        """Получение вложения задачи/подзадачи"""
        stmt = (
            select(Attachment)
            .where(
                Attachment.parent_type == parent,
                Attachment.parent_id == parent_id,
                Attachment.uploaded_by == user_id
            )
        )
        results = await self.session.execute(stmt)
        return list(results.scalars().all())

    async def get_attachment_by_id(
            self,
            attachment_id: UUID,
            user_id: int
    ) -> Optional[Attachment]:
        """Получение вложения по id"""
        stmt = (
            select(Attachment)
            .where(
                Attachment.id == attachment_id,
                Attachment.uploaded_by == user_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().one_or_none()

    async def count_by_parent(
            self,
            parent: AttachmentParentType,
            parent_id: int
    ) -> int:
        """Возвращает количество вложений у родителя"""
        stmt = (
            select(func.count(Attachment.id)) # type: ignore
            .where(
                Attachment.parent_type == parent,
                Attachment.parent_id == parent_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def delete(self, attachment: Attachment) -> None:
        """Удалить вложение"""
        await self.session.delete(attachment)
        await self.session.commit()

    async def get_by_s3_key(self, s3_key: str) -> Optional[Attachment]:
        """Поиск вложения по S3-ключу (для MinIO интеграции)."""
        stmt = (
            select(Attachment)
            .where(Attachment.s3_key == s3_key)
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def update(self, attachment: Attachment) -> Attachment:
        """Обновление вложения"""
        self.session.add(attachment)
        await self.session.commit()
        await self.session.refresh(attachment)
        return attachment


    async def delete_all_by_parent(
            self, 
            parent_type: AttachmentParentType, 
            parent_id: int
            ) -> None:
        """Удаление всех вложений у родителя"""
        stmt = (
            delete(Attachment)
            .where(
                Attachment.parent_type == parent_type, # type: ignore
                Attachment.parent_id == parent_id # type: ignore
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()
        