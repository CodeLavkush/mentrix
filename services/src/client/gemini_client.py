from google import genai

from langchain_google_genai import GoogleGenerativeAIEmbeddings

from ..utils.config import settings
from ..utils.logger import logger


# -----------------------------------------------------
# Gemini Client
# -----------------------------------------------------

gemini_client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
)


# -----------------------------------------------------
# Embedding Model
# -----------------------------------------------------

embedding_model = GoogleGenerativeAIEmbeddings(
    model=settings.EMBEDDING_MODEL,
    google_api_key=settings.GEMINI_API_KEY,
)


# -----------------------------------------------------
# Chat Completion
# -----------------------------------------------------

def generate_content(
    prompt: str,
    system_prompt: str | None = None,
) -> str:
    """
    Generate a response from Gemini.

    Args:
        prompt: User prompt.
        system_prompt: Optional system instructions.

    Returns:
        Generated text response.
    """

    try:
        contents = prompt

        if system_prompt:
            contents = f"{system_prompt}\n\nUser:\n{prompt}"

        response = gemini_client.models.generate_content(
            model=settings.CHAT_MODEL,
            contents=contents,
        )

        return response.text

    except Exception:
        logger.exception("Failed to generate Gemini response")
        raise


# -----------------------------------------------------
# Embeddings
# -----------------------------------------------------

def embed_query(query: str) -> list[float]:
    """
    Generate embedding for a search query.
    """

    try:
        return embedding_model.embed_query(query)

    except Exception:
        logger.exception("Failed to generate query embedding")
        raise


def embed_documents(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple documents.
    """

    try:
        return embedding_model.embed_documents(texts)

    except Exception:
        logger.exception("Failed to generate document embeddings")
        raise