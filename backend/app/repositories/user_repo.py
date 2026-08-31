from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Optional
from app.models.user import User, BlockingEmail


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: User) -> User:
        """Создать пользователя."""
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        """Получить пользователя по email."""
        # ✅ Исправлено: exec() → execute() + scalars().first()
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_pending_email(self, pending_email: str) -> Optional[User]:
        """Получить пользователя по email."""
        # ✅ Исправлено: exec() → execute() + scalars().first()
        result = await self.db.execute(select(User).where(User.pending_email == pending_email))
        return result.scalars().first()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Получить пользователя по ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def save(self, user: User) -> User:
        """Сохранить пользователя (обновить)."""
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_blocking_email(self, blocking_email: BlockingEmail) -> BlockingEmail:
        """Создать пользователя."""
        self.db.add(blocking_email)
        await self.db.commit()
        await self.db.refresh(blocking_email)
        return blocking_email

    async def get_by_blocking_email(self, check_email: str) -> Optional[BlockingEmail]:
        """Получить пользователя по email."""
        # ✅ Исправлено: exec() → execute() + scalars().first()
        result = await self.db.execute(select(BlockingEmail).where(BlockingEmail.email == check_email))
        return result.scalars().first()

    async def save_blocking_email(self, blocking_email: BlockingEmail) -> BlockingEmail:
        """Сохранить пользователя (обновить)."""
        await self.db.commit()
        await self.db.refresh(blocking_email)
        return blocking_email
