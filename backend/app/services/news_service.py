
from typing import List, Dict, Any, Optional
import logging
from ddgs import DDGS
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings

logger = logging.getLogger(__name__)

class NewsService:
    """
    Service to fetch REAL-TIME news from the web using search tools.
    Replaces the old 'scrape top post' logic with 'Ask the Internet'.
    """
    
    def __init__(self):
        # Initialize LLM only if key is set, otherwise fall back to raw search
        try:
            if settings.openai_api_key:
                self.llm = ChatOpenAI(
                    model_name="gpt-4o", # Use 4o for speed/quality if available
                    temperature=0,
                    openai_api_key=settings.openai_api_key
                )
            else:
                self.llm = None
        except Exception as e:
            logger.warning(f"Failed to init LLM for NewsService: {e}")
            self.llm = None

    async def get_latest_news(self, symbol: str) -> str:
        """
        Search the web for the latest news about a symbol.
        Returns a concise summary or the raw search snippets.
        """
        query = f"{symbol} stock news financial"
        logger.info(f"NewsService: Searching web for '{query}'...")
        
        try:
            # 1. Perform Web Search
            # We use duckduckgo_search directly
            # This is sync, but fast. In production, wrap in asyncio.to_thread
            raw_results = ""
            with DDGS() as ddgs:
                results_gen = ddgs.text(query, max_results=5)
                # Convert generator to string summary
                results_list = list(results_gen)
                raw_results = "\n\n".join([f"- {r.get('title')}: {r.get('body')}" for r in results_list])
            
            if not raw_results:
                return "No search results found."

            if not self.llm:
                return f"Latest Search Results: {raw_results[:500]}..."

            # 2. (Optional) Synthesize with LLM 
            # User said: "U dont have to implement AI summarization... if u just send the prompt... the api would search"
            # But raw DDG results can be messy. Let's do a very lightweight "Filter" to ensure it looks like a clean answer.
            # We strictly answer the user's question: "What is the latest news?"
            
            prompt = ChatPromptTemplate.from_template(
                """
                You are a financial news reporter. 
                I will provide you with search results for stock {symbol}.
                Please verify if there is any SIGNIFICANT, RECENT news (last 24h).
                
                Search Results:
                {results}
                
                If there is relevant news, summarize the TOP headline in 1-2 sentences. 
                If the results are generic or old, just say "No major breaking news found in the last 24h."
                Do not make up facts. content must be from results.
                """
            )
            
            chain = prompt | self.llm
            response = await chain.ainvoke({"symbol": symbol, "results": raw_results})
            
            return response.content

        except Exception as e:
            logger.error(f"News search failed for {symbol}: {e}")
            return f"Could not fetch live news for {symbol}. (Error: {str(e)})"
