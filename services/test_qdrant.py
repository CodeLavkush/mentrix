from qdrant_client import QdrantClient
from src.utils.config import settings

print("Creating Qdrant client...")

client = QdrantClient(
    host=settings.QDRANT_HOST,
    port=settings.QDRANT_PORT,
)

print("Connected!")

print(client.get_collections())