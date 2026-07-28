from pathlib import Path

from langchain_core.documents import Document

from ..client.minio_client import download_file
from ..services.ocr_service import ocr_pdf
from ..services.pdf_service import is_scanned_pdf, load_pdf
from ..utils.logger import logger


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class DocumentProcessor:
    """
    Responsible for:
        - Downloading PDFs from MinIO
        - Detecting scanned vs digital PDFs
        - Extracting document text
    """

    def __init__(
        self,
        document_id: str,
        user_id: str,
        storage_path: str,
    ):
        self.document_id = document_id
        self.user_id = user_id
        self.storage_path = storage_path

        # Preserve the original extension (.pdf, .docx, etc.)
        extension = Path(storage_path).suffix or ".pdf"

        self.local_pdf = UPLOAD_DIR / f"{document_id}{extension}"

    def download(self) -> Path:
        """
        Download the document from MinIO.
        """

        logger.info(
            "Downloading document %s from MinIO...",
            self.document_id,
        )

        download_file(
            object_name=self.storage_path,
            destination=str(self.local_pdf),
        )

        logger.info(
            "Document downloaded successfully: %s",
            self.local_pdf,
        )

        return self.local_pdf

    def load(self) -> list[Document]:
        """
        Download and extract text from the document.

        Automatically chooses OCR if required.
        """

        pdf_path = self.download()

        if is_scanned_pdf(str(pdf_path)):
            logger.info(
                "Scanned PDF detected. Using OCR."
            )

            documents = ocr_pdf(str(pdf_path))

        else:
            logger.info(
                "Digital PDF detected. Extracting embedded text."
            )

            documents = load_pdf(str(pdf_path))

        # Attach additional metadata to every page
        for document in documents:
            document.metadata.update(
                {
                    "document_id": self.document_id,
                    "user_id": self.user_id,
                    "storage_path": self.storage_path,
                }
            )

        logger.info(
            "Successfully extracted %d page(s).",
            len(documents),
        )

        return documents

    def cleanup(self) -> None:
        """
        Delete the downloaded file after processing.
        """

        try:
            if self.local_pdf.exists():
                self.local_pdf.unlink()

                logger.info(
                    "Deleted temporary file: %s",
                    self.local_pdf,
                )

        except Exception:
            logger.exception(
                "Failed to delete temporary file."
            )