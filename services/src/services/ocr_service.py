from pathlib import Path

from src.services.image_preprocessor import image_preprocessor
from src.services.vision_service import vision_service
from src.utils.logger import logger


class OCRService:
    """
    Handles OCR using the Gemini Vision Service.

    Responsibilities:
    - Preprocess image for better OCR accuracy
    - Extract text using Gemini Vision
    - Clean extracted text
    - Remove temporary processed images
    """

    def extract_text(self, image_path: Path) -> str:
        """
        Extract text from an image.
        """

        logger.info(
            "Running OCR on %s",
            image_path.name,
        )

        processed_image = image_preprocessor.preprocess(
            image_path
        )

        try:
            text = vision_service.extract_text(
                processed_image
            )

            if not text:
                logger.warning(
                    "No text detected in %s",
                    image_path.name,
                )
                return ""

            cleaned_text = self._clean_text(text)

            logger.info(
                "OCR completed. Extracted %d characters.",
                len(cleaned_text),
            )

            return cleaned_text

        finally:
            try:
                processed_image.unlink(
                    missing_ok=True,
                )

                logger.debug(
                    "Deleted temporary image: %s",
                    processed_image,
                )

            except Exception:
                logger.warning(
                    "Failed to delete temporary image: %s",
                    processed_image,
                    exc_info=True,
                )

    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Remove empty lines and trim whitespace.
        """

        return "\n".join(
            line.strip()
            for line in text.splitlines()
            if line.strip()
        )


ocr_service = OCRService()