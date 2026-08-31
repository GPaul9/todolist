
from typing import Generator

from sqlmodel import create_engine, SQLModel, Session


DATABASE_URL = "postgresql://todo_user:todo_password@localhost:5432/todo_db"

sync_engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables() -> None:
    """Создаёт таблицы в БД (временно, потом — Alembic)"""
    SQLModel.metadata.create_all(sync_engine)


def get_session() -> Generator[Session, None, None]:
    """Генератор сессии для FastAPI-зависимостей"""
    with Session(sync_engine) as session:
        yield session


# get_session = Depends(_get_session)

# async_engine = create_async_engine(
#     "postgresql+asyncpg://todo_user:todo_pass@localhost:5432/todo_db",
#     future=True,
# )
#
# async_session = async_sessionmaker(
#     bind=async_engine,
#     class_=AsyncSession,
#     expire_on_commit=False,
# )
#
#
# async def _get_async_session() -> AsyncGenerator[AsyncSession, None]:
#     async with async_session() as session:
#         yield session
#
#
# get_async_session = Depends(_get_async_session)
#
#
# async def create_db_and_tables() -> None:
#     SQLModel.metadata.create_all(sync_engine)
