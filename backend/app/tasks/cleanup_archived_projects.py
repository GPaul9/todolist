# app/tasks/cleanup_archived_projects.py
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.project import Project
from app.repositories.project_repo import ProjectRepository
from app.models.enums import ProjectStatus
from celery_config import celery_app

logger = logging.getLogger(__name__)


def get_or_create_event_loop():
    """Безопасное получение/создание event loop для Celery worker."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            raise RuntimeError("Loop closed")
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop


def create_cleanup_engine():
    """Создаёт новый engine для каждого вызова задачи."""
    return create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_size=1,
        max_overflow=0,
    )


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def cleanup_archived_projects_task(self, dry_run: bool = False, batch_size: int = 50):
    """Автоматическое удаление архивных проектов старше 90 дней."""
    loop = get_or_create_event_loop()
    try:
        loop.run_until_complete(_execute_cleanup(dry_run, batch_size))
    except Exception as e:
        logger.error(f"💥 Ошибка выполнения задачи: {e}")
        raise self.retry(exc=e)


async def _execute_cleanup(dry_run: bool, batch_size: int):
    threshold = datetime.now(timezone.utc) - timedelta(days=90)
    deleted_total = 0

    # Создаём engine и session ВНУТРИ async функции
    engine = create_cleanup_engine()
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            while True:
                stmt = (
                    select(Project)
                    .where(
                        Project.status.in_([ProjectStatus.ARCHIVED_BY_USER, ProjectStatus.ARCHIVED_BY_CASCADE]),
                        Project.archived_at.isnot(None),
                        Project.archived_at <= threshold
                    )
                    .limit(batch_size)
                )
                result = await session.execute(stmt)
                projects = result.scalars().all()

                if not projects:
                    break

                repo = ProjectRepository(session)
                for project in projects:
                    try:
                        if dry_run:
                            logger.info(f"[DRY RUN] Будет удалён: ID={project.id} | '{project.title}'")
                        else:
                            await repo.delete(project)
                            await session.commit()
                            logger.info(f"Удалён: ID={project.id} | '{project.title}'")
                        deleted_total += 1
                    except Exception as e:
                        logger.error(f"Ошибка удаления ID={project.id}: {e}")
                        await session.rollback()
                        continue

            logger.info(f"Завершено. Обработано: {deleted_total} проектов. (dry_run={dry_run})")

        except Exception as e:
            logger.error(f"Критическая ошибка задачи очистки: {e}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()