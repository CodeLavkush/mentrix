from pathlib import Path

import fitz  # PyMuPDF
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader

from ..utils.logger import logger


def is_scanned_pdf(
    pdf_path: str,
    minimum_chars: int = 50,
) -> bool:
    """
    Determine whether a PDF is scanned or digital.

    A PDF is considered scanned if the extracted text
    from all pages is below the minimum character threshold.
    """

    document = fitz.open(pdf_path)

    total_chars = 0

    try:
        for page in document:
            total_chars += len(page.get_text().strip())

        logger.info(
            "PDF '%s' contains %s extracted characters",
            Path(pdf_path).name,
            total_chars,
        )

        return total_chars < minimum_chars

    finally:
        document.close()


def load_pdf(
    pdf_path: str,
) -> list[Document]:
    """
    Extract text from a digital PDF.

    Returns LangChain Documents.
    """

    logger.info(
        "Loading digital PDF: %s",
        Path(pdf_path).name,
    )

    loader = PyPDFLoader(pdf_path)

    documents = loader.load()

    logger.info(
        "Loaded %d pages",
        len(documents),
    )

    return documents


def extract_page_count(
    pdf_path: str,
) -> int:
    """
    Return total number of pages.
    """

    document = fitz.open(pdf_path)

    try:
        return document.page_count

    finally:
        document.close()