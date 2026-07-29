import tempfile
from pathlib import Path

import fitz

from clients.minio_client import minio_client
from utils.logger import logger
from .ocr_service import OCRService


class DocumentProcessor:
    def __init__(self):
        self.ocr_service = OCRService()

    def process_document(self, storage_path: str) -> str:
        """
        Downloads a document from MinIO and extracts its text.
        """

        logger.info(f"Processing document: {storage_path}")

        with tempfile.TemporaryDirectory() as temp_dir:
            pdf_path = Path(temp_dir) / "document.pdf"

            minio_client.download_file(
                object_name=storage_path,
                destination=str(pdf_path),
            )

            if self._is_scanned_pdf(pdf_path):
                logger.info("Scanned PDF detected. Running OCR...")
                text = self.ocr_service.extract_text(pdf_path)
            else:
                logger.info("Digital PDF detected. Extracting text...")
                text = self._extract_text(pdf_path)

            logger.info(
                f"Extracted {len(text)} characters from document."
            )

            return text

    def _extract_text(self, pdf_path: Path) -> str:
        """
        Extract text from a digital PDF using PyMuPDF.
        """

        document = fitz.open(pdf_path)

        pages = []

        try:
            for page in document:
                pages.append(page.get_text())
        finally:
            document.close()

        return "\n".join(pages).strip()

    def _is_scanned_pdf(self, pdf_path: Path) -> bool:
        """
        Determines whether the PDF is scanned by checking if
        enough selectable text exists.
        """

        document = fitz.open(pdf_path)

        total_chars = 0

        try:
            for page in document:
                total_chars += len(page.get_text().strip())

                if total_chars > 100:
                    return False
        finally:
            document.close()

        return True


document_processor = DocumentProcessor()