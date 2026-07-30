from pathlib import Path

import pytesseract
from pdf2image import convert_from_path
from PIL import Image

from src.utils.config import settings
from src.utils.logger import logger


class OCRService:
    def __init__(self):
        # Configure tesseract executable (mainly needed on Windows)
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    def extract_text(self, pdf_path: Path) -> str:
        """
        Extract text from a scanned PDF using OCR.
        """

        logger.info("Converting PDF pages to images...")

        images = convert_from_path(
            pdf_path=str(pdf_path),
            dpi=300,
            poppler_path=settings.POPPLER_PATH,
        )

        logger.info(f"{len(images)} pages detected.")

        pages = []

        for page_number, image in enumerate(images, start=1):
            logger.info(f"OCR Page {page_number}/{len(images)}")

            text = self._ocr_image(image)

            pages.append(text)

        return "\n".join(pages).strip()

    def _ocr_image(self, image: Image.Image) -> str:
        """
        Perform OCR on a PIL image.
        """

        # Convert to grayscale
        image = image.convert("L")

        text = pytesseract.image_to_string(
            image,
            lang="eng",
            config="--oem 3 --psm 6",
        )

        return self._clean_text(text)

    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Remove excessive blank lines and whitespace.
        """

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        return "\n".join(lines)


ocr_service = OCRService()