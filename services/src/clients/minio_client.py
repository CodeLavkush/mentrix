from minio import Minio
from minio.error import S3Error

from src.utils.config import settings
from src.utils.logger import logger


class MinioClient:
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )

    def bucket_exists(self) -> bool:
        return self.client.bucket_exists(settings.MINIO_BUCKET)

    def ensure_bucket(self):
        if not self.bucket_exists():
            logger.info(
                f"Creating MinIO bucket: {settings.MINIO_BUCKET}"
            )
            self.client.make_bucket(settings.MINIO_BUCKET)

    def download_file(self, object_name: str, destination: str):
        try:
            logger.info(f"Downloading {object_name}")

            self.client.fget_object(
                bucket_name=settings.MINIO_BUCKET,
                object_name=object_name,
                file_path=destination,
            )

            logger.info("Download completed")

        except S3Error as e:
            logger.exception(e)
            raise

    def upload_file(
        self,
        object_name: str,
        file_path: str,
        content_type: str = "application/pdf",
    ):
        self.client.fput_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=object_name,
            file_path=file_path,
            content_type=content_type,
        )


minio_client = MinioClient()