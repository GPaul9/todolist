from datetime import timedelta
from typing import List

from minio import Minio, S3Error
from fastapi.concurrency import run_in_threadpool
from minio.commonconfig import CopySource
from minio.datatypes import Object

from app.core.config import settings


class MinIOService:
    def __init__(self):
        self.internal_client = Minio(
            settings.MINIO_INTERNAL_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False
        )

        self.external_client = Minio(
            settings.MINIO_PUBLIC_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False,
            region=settings.MINIO_REGION
        )
        self.bucket = settings.MINIO_BUCKET

    async def init_buckets(self):
        exists = await run_in_threadpool(self.internal_client.bucket_exists, self.bucket)
        if not exists:
            await run_in_threadpool(self.internal_client.make_bucket, self.bucket)

    async def generate_presigned_upload_url(
            self,
            s3_key: str,
    ) -> str:
        result = await run_in_threadpool(
            self.external_client.presigned_put_object,
            self.bucket,
            object_name=s3_key,
            expires=timedelta(minutes=settings.MINIO_EXPIRES_UPLOAD_URL)
        )
        return result

    async def generate_presigned_download_url(
            self,
            s3_key: str,
    ) -> str:
        result = await run_in_threadpool(
            self.external_client.presigned_get_object,
            self.bucket,
            object_name=s3_key,
            expires=timedelta(minutes=settings.MINIO_EXPIRES_UPLOAD_URL)
        )
        return result

    async def exists(self, s3_key: str) -> bool:
        try:
            await run_in_threadpool(
                self.internal_client.stat_object,
                self.bucket,
                object_name=s3_key
            )
            return True
        except S3Error:
            return False

    async def delete(self, s3_key: str):
        await run_in_threadpool(
            self.internal_client.remove_object,
            self.bucket,
            object_name=s3_key
        )

    async def list_all_objects(self) -> List[Object]:
        def _list():
            return list(self.internal_client.list_objects(self.bucket, recursive=True))
        return await run_in_threadpool(_list)
    
    async def get_object(self, s3_key: str) -> bytes:
        def _get():
            return self.internal_client.get_object(self.bucket, s3_key).read()
        return await run_in_threadpool(_get)

    async def copy_to_main(self, qarantine_s3_key: str, final_s3_key:str) -> None:
        await run_in_threadpool(
            self.internal_client.copy_object,
            self.bucket,
            final_s3_key,
            CopySource(self.bucket, qarantine_s3_key)
        )
        # def upload_avatar(self, user_id: int, data: bytes, filename: str) -> str:
        #     object_name = f"avatars/{user_id}/{filename}"
        #     self.client.put_object(self.bucket, object_name, data, len(data))
        #     return f"http://{settings.MINIO_ENDPOINT}/{self.bucket}/{object_name}"
