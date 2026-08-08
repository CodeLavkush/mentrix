import tempfile
from pathlib import Path

from src.clients.minio_client import minio_client
from src.services.extractor_service import extractor_service
from src.utils.logger import logger


class DocumentProcessor:
    """
    Orchestrates document processing.

    Responsibilities:
    - Download document from MinIO
    - Send document to ExtractorService
    - Return extracted text
    """

    def process_document(
        self,
        document_id: str,
        storage_path: str,
    ) -> str:

        logger.info(
            "Processing document: %s",
            document_id,
        )

        with tempfile.TemporaryDirectory() as temp_dir:

            temp_dir = Path(temp_dir)

            suffix = Path(
                storage_path
            ).suffix.lower()

            local_file = (
                temp_dir
                / f"{document_id}{suffix}"
            )

            logger.info(
                "Downloading document from MinIO..."
            )

            minio_client.download_file(
                object_name=storage_path,
                destination=str(local_file),
            )

            logger.info(
                "Document downloaded successfully."
            )

            # Unified extraction
            text = extractor_service.extract_text(
                local_file
            )

            if not text or not text.strip():
                raise ValueError(
                    "No text could be extracted "
                    "from the document."
                )

            logger.info(
                "Document processing completed. "
                "Extracted %d characters.",
                len(text),
            )

            return text


document_processor = DocumentProcessor()