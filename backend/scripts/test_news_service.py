
import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from app.services.news_service import NewsService
from app.config import settings

# Mock settings just in case
if not settings.openai_api_key:
    print("WARNING: OpenAI API Key not found in env. Falling back to raw search.")

async def demo_news_fetch():
    print("\n--- DEMO: News Service (Live Search) ---")
    service = NewsService()
    
    ticker = "Anthropic"
    print(f"Fetching latest news for ${ticker}...")
    
    try:
        # Since 'search_tool.run' is synchronous in LangChain, let's just create a wrapper or call directly
        # The class does 'await chain.ainvoke' but search is sync? Let's fix that in service if needed
        # But for now let's just try running it
        
        # We need to manually run the search part async-friendly or accept it blocks
        # The NewsService code I wrote: 
        # raw_results = self.search_tool.run(query) <- This is sync.
        # But 'await chain.ainvoke' <- async.
        # So calling 'await service.get_latest_news' will block during 'self.search_tool.run' but work.
        
        news = await service.get_latest_news(ticker)
        print(f"\n✅ Result for ${ticker}:")
        print(f"\"{news}\"")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(demo_news_fetch())
