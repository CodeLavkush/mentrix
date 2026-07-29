from google import genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from utils.config import settings


class GeminiClient:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self.embedding_model = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
        )

    def generate(self, prompt: str) -> str:
        response = self.client.models.generate_content(
            model=settings.CHAT_MODEL,
            contents=prompt,
        )

        return response.text


gemini_service = GeminiClient()