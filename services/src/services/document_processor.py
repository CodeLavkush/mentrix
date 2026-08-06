import tempfile
from pathlib import Path

from src.clients.minio_client import minio_client
from src.services.ocr_service import ocr_service
from src.services.pdf_service import pdf_service
from src.utils.logger import logger


class DocumentProcessor:
    """
    Orchestrates document processing.

    Responsibilities:
    - Download document from MinIO
    - Route PDFs to PDF service
    - Route images to OCR service
    """

    IMAGE_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".tif",
        ".tiff",
        ".webp",
    }

    def process_document(
        self,
        document_id: str,
        storage_path: str,
    ) -> str:
        logger.info(f"Processing document: {document_id}")

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir = Path(temp_dir)

            suffix = Path(storage_path).suffix.lower()
            local_file = temp_dir / f"{document_id}{suffix}"

            logger.info("Downloading document from MinIO...")

            minio_client.download_file(
                object_name=storage_path,
                destination=str(local_file),
            )

            logger.info("Document downloaded successfully.")

            if suffix == ".pdf":
                logger.info("PDF detected.")
                text = pdf_service.extract_text(local_file)

            elif suffix in self.IMAGE_EXTENSIONS:
                logger.info("Image detected. Running OCR...")
                text = ocr_service.extract_text(local_file)

            else:
                raise ValueError(f"Unsupported file type: {suffix}")

            logger.info(
                "Document processing completed. Extracted %d characters.",
                len(text),
            )

            return text


document_processor = DocumentProcessor()