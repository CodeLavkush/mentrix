from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from .gemini_client import embedding_model
from langchain_qdrant import QdrantVectorStore

from ..utils.config import settings

# ----------------------------------------
# Qdrant Client
# ----------------------------------------

qdrant_client = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)


# ----------------------------------------
# Create Collection (if not exists)
# ----------------------------------------

collections = qdrant_client.get_collections().collections

collection_exists = any(
    collection.name == settings.QDRANT_COLLECTION
    for collection in collections
)

if not collection_exists:
    vector_size = len(
        embedding_model.embed_query("Mentrix")
    )

    qdrant_client.create_collection(
        collection_name=settings.QDRANT_COLLECTION,
        vectors_config=VectorParams(
            size=vector_size,
            distance=Distance.COSINE,
        ),
    )


# ----------------------------------------
# LangChain Vector Store
# ----------------------------------------

vector_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name=settings.QDRANT_COLLECTION,
    embedding=embedding_model,
)