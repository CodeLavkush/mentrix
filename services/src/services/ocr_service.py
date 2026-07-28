from pathlib import Path

import pytesseract

from langchain_core.documents import Document
from pdf2image import convert_from_path

from ..utils.config import settings
from ..utils.logger import logger


# Configure Tesseract executable (mainly needed on Windows)
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


def ocr_pdf(pdf_path: str) -> list[Document]:
    """
    Extract text from a scanned PDF using OCR.

    Returns:
        List[Document]
    """

    logger.info(
        "Running OCR on %s",
        Path(pdf_path).name,
    )

    images = convert_from_path(pdf_path)

    documents: list[Document] = []

    for page_number, image in enumerate(images, start=1):

        text = pytesseract.image_to_string(image)

        documents.append(
            Document(
                page_content=text.strip(),
                metadata={
                    "source": pdf_path,
                    "page": page_number - 1,
                    "page_label": str(page_number),
                    "ocr": True,
                },
            )
        )

        logger.info(
            "OCR completed for page %d",
            page_number,
        )

    logger.info(
        "OCR completed (%d pages)",
        len(documents),
    )

    return documents