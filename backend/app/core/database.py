from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,
    echo_pool=True
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# ✅ ИСПРАВЛЕНО: Правильная сигнатура + @asynccontextmanager
from contextlib import asynccontextmanager


@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()


# async def init_db() -> None:
#     async with engine.begin() as conn:
#         await conn.run_sync(SQLModel.metadata.create_all)


async def close_db() -> None:
    await engine.dispose()


def create_session_factory():
    engine = create_async_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
