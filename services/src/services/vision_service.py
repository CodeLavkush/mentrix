import random
import time
from pathlib import Path

from google import genai
from google.genai import types

from src.utils.config import settings
from src.utils.logger import logger


class VisionService:
    """
    OCR using Gemini Vision.
    """

    MODEL = settings.GEMINI_VISION_MODEL

    MAX_RETRIES = 3
    BASE_RETRY_DELAY = 90

    SYSTEM_PROMPT = """
You are a professional OCR engine.

Extract ALL visible text exactly as written.

Rules:

- Return ONLY extracted text.
- Preserve reading order.
- Preserve paragraphs.
- Preserve tables as plain text.
- Preserve punctuation.
- Preserve spelling exactly.
- Never summarize.
- Never explain.
- Never translate.
- Never hallucinate missing words.
- Skip unreadable text instead of guessing.
"""

    def __init__(self):
        logger.info(
            "Initializing Gemini Vision Service..."
        )

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        logger.info(
            "Gemini Vision initialized with model: %s",
            self.MODEL,
        )

    def extract_text(
        self,
        image_path: Path,
    ) -> str:
        """
        Extract OCR text from an image.
        """

        image_bytes = image_path.read_bytes()
        mime_type = self._get_mime_type(image_path)

        for attempt in range(
            1,
            self.MAX_RETRIES + 1,
        ):
            try:
                logger.info(
                    "OCR request (%d/%d): %s",
                    attempt,
                    self.MAX_RETRIES,
                    image_path.name,
                )

                response = (
                    self.client.models.generate_content(
                        model=self.MODEL,
                        contents=[
                            types.Part.from_bytes(
                                data=image_bytes,
                                mime_type=mime_type,
                            ),
                        ],
                        config=types.GenerateContentConfig(
                            temperature=0,
                            system_instruction=(
                                self.SYSTEM_PROMPT
                            ),
                        ),
                    )
                )

                text = (
                    response.text or ""
                ).strip()

                if not text:
                    raise RuntimeError(
                        "Gemini returned an empty "
                        "OCR response."
                    )

                logger.info(
                    "OCR completed successfully "
                    "for %s (%d chars)",
                    image_path.name,
                    len(text),
                )

                return text

            except Exception as exc:
                message = str(exc)

                logger.warning(
                    "Gemini OCR failed (%d/%d): %s",
                    attempt,
                    self.MAX_RETRIES,
                    message,
                )

                if attempt == self.MAX_RETRIES:
                    raise

                retryable = any(
                    error in message.lower()
                    for error in (
                        "429",
                        "503",
                        "quota",
                        "rate",
                        "unavailable",
                        "resource exhausted",
                    )
                )

                if not retryable:
                    raise

                delay = (
                    self.BASE_RETRY_DELAY
                    * (2 ** (attempt - 1))
                    + random.uniform(0, 1)
                )

                logger.info(
                    "Retrying in %.1f seconds...",
                    delay,
                )

                time.sleep(delay)

        raise RuntimeError(
            "OCR failed."
        )

    @staticmethod
    def _get_mime_type(
        image_path: Path,
    ) -> str:

        return {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".bmp": "image/bmp",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".tif": "image/tiff",
            ".tiff": "image/tiff",
        }.get(
            image_path.suffix.lower(),
            "image/jpeg",
        )


vision_service = VisionService()