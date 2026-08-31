import asyncio
from app.core.config import settings
from app.core.database import create_session_factory
from app.repositories.attachment_repo import AttachmentRepository
from app.services.cleanup_service import CleanupService
from app.storage.minio import MinIOService
from celery_config import celery_app

@celery_app.task
def cleanup_orphaned_attachments():
    asyncio.run(_cleanup_orphaned_attachments())

async def _cleanup_orphaned_attachments():
    SessionLocal = create_session_factory()
    async with SessionLocal() as session:
        attachement_repo = AttachmentRepository(session)
        storage_service = MinIOService()
        cleanup_service = CleanupService(attachement_repo, storage_service)

        await cleanup_service.cleanup_unconfirmed_attachments(
            older_than_seconds = settings.MINIO_CLEANUP_TIME
        )