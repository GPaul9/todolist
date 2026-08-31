from datetime import timedelta, timezone, datetime

from app.repositories.attachment_repo import AttachmentRepository
from app.storage.minio import MinIOService


class CleanupService:

    def __init__(
            self,
            attachment_repo: AttachmentRepository,
            storage_service: MinIOService
            ) -> None:
        self.attachment_repo = attachment_repo
        self.storage_service = storage_service

    async def cleanup_unconfirmed_attachments(
            self,
            older_than_seconds: int = 600
    ) -> None:
        objects = await self.storage_service.list_all_objects()
        cutoff_time = (
            datetime.now(timezone.utc) - timedelta(seconds=older_than_seconds)
            ) # type: ignore
        
        for obj in objects:
            s3_key=obj.object_name
            db_record = await self.attachment_repo.get_by_s3_key(s3_key) # type: ignore

            should_delete = False
            if db_record is None:
                should_delete = True
            elif db_record.confirmed_at is None and db_record.created_at < cutoff_time:
                should_delete = True

            if should_delete:
                await self.storage_service.delete(s3_key) # type: ignore
                if db_record:
                    await self.attachment_repo.delete(db_record)
