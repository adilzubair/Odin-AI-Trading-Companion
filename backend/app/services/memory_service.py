import chromadb
from chromadb.config import Settings
from openai import OpenAI
import logging

from app.config import settings

logger = logging.getLogger(__name__)

class UserHistoryMemory:
    """
    Memory system for tracking user trading history and psychology.
    Stores 'User Activity' with rich context (News, Sentiment) to enable
    'The Sentinel' to find patterns like "You trade X when News Y happens".
    """
    def __init__(self, user_id="default_user"):
        self.user_id = user_id
        
        # Use settings object which properly loads from .env file
        api_key = settings.openai_api_key
        base_url = settings.backend_url if settings.llm_provider == "openai" else None
        
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.embedding_model = "text-embedding-3-small"
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.Client(Settings(allow_reset=True))
        self.collection_name = f"user_history_{user_id}"
        self.collection = self.chroma_client.get_or_create_collection(name=self.collection_name)

    def get_embedding(self, text):
        """Get OpenAI embedding for a text"""
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model, input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return [0.0] * 1536 # Return zero vector on failure (fallback)

    def add_activity(self, activity_text: str, metadata: dict):
        """
        Add a user activity to memory.
        
        Args:
            activity_text: Descriptive text (e.g., "Bought AAPL after positive earnings news")
            metadata: Dict containing raw data (symbol, side, quantity, news_summary, etc.)
        """
        embedding = self.get_embedding(activity_text)
        doc_id = str(uuid.uuid4())
        
        self.collection.add(
            documents=[activity_text],
            metadatas=[metadata],
            embeddings=[embedding],
            ids=[doc_id]
        )
        logger.info(f"Added activity to memory: {activity_text[:50]}...")

    def find_similar_situations(self, current_news_or_context: str, n_matches=3):
        """
        Find past user actions that occurred in similar contexts.
        Used by 'The Sentinel' to match current news to past behavior.
        """
        query_embedding = self.get_embedding(current_news_or_context)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_matches,
            include=["metadatas", "documents", "distances"]
        )

        matched_results = []
        if results["documents"]:
            for i in range(len(results["documents"][0])):
                matched_results.append({
                    "matched_situation": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "similarity_score": 1 - results["distances"][0][i]
                })

        return matched_results
