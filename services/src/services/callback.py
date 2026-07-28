import httpx

from ..utils.config import settings
from ..utils.logger import logger


class CallbackService:
    """
    Service responsible for notifying the Node.js backend
    about document processing status.
    """

    def __init__(self):
        self.base_url = settings.BACKEND_URL.rstrip("/")

    def update_document_status(
        self,
        document_id: str,
        status: str,
        error: str | None = None,
    ) -> None:
        """
        Update document status in the Node.js backend.

        Args:
            document_id: PostgreSQL document id
            status: READY | FAILED
            error: Optional failure reason
        """

        url = f"{self.base_url}/api/v1/internal/documents/status"

        payload = {
            "documentId": document_id,
            "status": status,
            "error": error,
        }

        try:
            logger.info(
                "Updating document %s status -> %s",
                document_id,
                status,
            )

            response = httpx.patch(
                url,
                json=payload,
                timeout=30.0,
            )

            response.raise_for_status()

            logger.info(
                "Document %s updated successfully",
                document_id,
            )

        except httpx.HTTPStatusError as e:
            logger.error(
                "Backend returned %s while updating document %s",
                e.response.status_code,
                document_id,
            )
            raise

        except Exception:
            logger.exception(
                "Failed to update document status"
            )
            raise


callback_service = CallbackService()