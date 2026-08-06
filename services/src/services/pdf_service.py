from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import tempfile

import fitz
from pdf2image import convert_from_path

from src.services.ocr_service import ocr_service
from src.utils.config import settings
from src.utils.logger import logger


class PDFService:
    """
    Handles PDF processing.

    Responsibilities:
    - Detect digital vs scanned PDFs
    - Extract text from digital PDFs using PyMuPDF
    - Convert scanned PDFs to images
    - Perform OCR on scanned pages in parallel
    """

    MIN_TEXT_PER_PAGE = 30

    def extract_text(self, pdf_path: Path) -> str:
        """
        Extract text from a PDF.
        """

        logger.info("Processing PDF: %s", pdf_path.name)

        if self._is_digital_pdf(pdf_path):
            logger.info("Digital PDF detected.")
            return self._extract_digital_text(pdf_path)

        logger.info("Scanned PDF detected. Starting OCR...")
        return self._extract_scanned_text(pdf_path)

    def _is_digital_pdf(self, pdf_path: Path) -> bool:
        """
        Determine whether a PDF contains selectable text.

        A PDF is considered digital if at least
        80% of its pages contain readable text.
        """

        document = fitz.open(pdf_path)

        try:
            total_pages = len(document)

            if total_pages == 0:
                logger.warning("PDF contains no pages.")
                return False

            text_pages = sum(
                1
                for page in document
                if len(page.get_text("text").strip())
                >= self.MIN_TEXT_PER_PAGE
            )

            ratio = text_pages / total_pages

            logger.debug(
                "Digital text pages: %d/%d (%.0f%%)",
                text_pages,
                total_pages,
                ratio * 100,
            )

            return ratio >= 0.8

        finally:
            document.close()

    def _extract_digital_text(self, pdf_path: Path) -> str:
        """
        Extract text directly using PyMuPDF.
        """

        document = fitz.open(pdf_path)

        try:
            pages = [
                page.get_text("text")
                for page in document
            ]

            logger.info(
                "Extracted text from %d digital pages.",
                len(pages),
            )

            return self._clean_text("\n".join(pages))

        finally:
            document.close()

    def _extract_scanned_text(self, pdf_path: Path) -> str:
        """
        Convert scanned PDF pages to images
        and run OCR in parallel.
        """

        images = convert_from_path(
            pdf_path=str(pdf_path),
            dpi=300,
            fmt="jpeg",
        )

        total_pages = len(images)

        logger.info(
            "Detected %d scanned pages.",
            total_pages,
        )

        if total_pages == 0:
            return ""

        with tempfile.TemporaryDirectory() as temp_dir:

            temp_dir = Path(temp_dir)

            image_paths: list[Path] = []

            for index, image in enumerate(images, start=1):

                image_path = temp_dir / f"page_{index}.jpg"

                image.save(
                    image_path,
                    format="JPEG",
                    quality=90,
                    optimize=True,
                )

                image_paths.append(image_path)

            pages = [""] * total_pages

            workers = min(
                settings.OCR_MAX_WORKERS,
                total_pages,
            )

            logger.info(
                "Running OCR using %d worker(s).",
                workers,
            )

            with ThreadPoolExecutor(
                max_workers=workers,
            ) as executor:

                futures = {
                    executor.submit(
                        ocr_service.extract_text,
                        image_path,
                    ): index
                    for index, image_path in enumerate(image_paths)
                }

                for future in as_completed(futures):

                    index = futures[future]

                    try:
                        pages[index] = future.result()

                        logger.info(
                            "OCR page %d/%d completed.",
                            index + 1,
                            total_pages,
                        )

                    except Exception:
                        logger.exception(
                            "OCR failed for page %d.",
                            index + 1,
                        )

            logger.info(
                "Completed OCR for %d pages.",
                total_pages,
            )

        return self._clean_text("\n".join(pages))

    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Remove blank lines and trim whitespace.
        """

        return "\n".join(
            line.strip()
            for line in text.splitlines()
            if line.strip()
        )


pdf_service = PDFService()