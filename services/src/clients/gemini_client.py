import json

from google import genai
from google.genai import types
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from src.utils.config import settings


class GeminiClient:

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self.embedding_model = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
        )

    def generate(
        self,
        prompt: str,
    ) -> str:

        response = self.client.models.generate_content(
            model=settings.CHAT_MODEL,
            contents=prompt,
        )

        return response.text

    def generate_json(
        self,
        prompt: str,
    ) -> dict:

        response = self.client.models.generate_content(
            model=settings.CHAT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3,
            ),
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        try:
            return json.loads(response.text)

        except json.JSONDecodeError as error:
            raise RuntimeError(
                "Gemini returned invalid JSON."
            ) from error


gemini_service = GeminiClient()