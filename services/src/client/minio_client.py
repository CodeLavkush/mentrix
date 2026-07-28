from minio import Minio
from minio.error import S3Error

from ..utils.config import settings


minio_client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)

BUCKET_NAME = settings.MINIO_BUCKET


def bucket_exists() -> bool:
    """
    Check if the configured bucket exists.
    """
    return minio_client.bucket_exists(BUCKET_NAME)


def ensure_bucket() -> None:
    """
    Create the bucket if it doesn't exist.
    """
    if not bucket_exists():
        minio_client.make_bucket(BUCKET_NAME)


def download_file(
    object_name: str,
    destination: str,
) -> str:
    """
    Download a file from MinIO.

    Args:
        object_name: Object key stored in MinIO.
        destination: Local file path.

    Returns:
        Local file path.
    """

    minio_client.fget_object(
        bucket_name=BUCKET_NAME,
        object_name=object_name,
        file_path=destination,
    )

    return destination


def delete_file(object_name: str) -> None:
    """
    Delete an object from MinIO.
    """

    minio_client.remove_object(
        bucket_name=BUCKET_NAME,
        object_name=object_name,
    )


def stat_file(object_name: str):
    """
    Get object metadata.
    """

    return minio_client.stat_object(
        bucket_name=BUCKET_NAME,
        object_name=object_name,
    )