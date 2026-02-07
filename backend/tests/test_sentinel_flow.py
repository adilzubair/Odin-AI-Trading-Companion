import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from app.core.database import init_db, close_db
from app.services.sentinel_service import SentinelService
from app.services.memory_service import UserHistoryMemory
from app.models.database import Signal, UserActivity
from datetime import datetime
from unittest.mock import patch, MagicMock

async def test_sentinel_flow():
    await init_db()
    
    # MOCK OPENAI to avoid API Key errors and costs
    with patch("app.services.memory_service.OpenAI"), \
         patch.object(UserHistoryMemory, "get_embedding", return_value=[0.1] * 1536):
        
        # 1. Hydrate Memory with a Fake Past Action
        memory = UserHistoryMemory()
        print("🧠 Hydrating Memory...")
        
        past_action_text = "User bought AAPL stock after highly positive earnings report and rumors of new AI features."
        memory.add_activity(
            activity_text=past_action_text,
            metadata={
                "activity_id": 999,
                "Symbol": "AAPL",
                "activity_type": "trade_attempt",
                "timestamp": datetime.now().isoformat()
            }
        )
        
        # 3. Simulate a New Incoming Signal (Similar context)
        print("📡 Simulating New Signal...")
        signal = Signal(
            symbol="AAPL",
            source="news_feed",
            source_detail="Analyst Report",
            sentiment=0.9,
            timestamp=datetime.now(),
            reason="Apple earnings beat expectations and new AI features announced for next iPhone."
        )
        
        # 4. Run Sentinel
        print("🤖 Running Sentinel...")
        
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            sentinel = SentinelService(session)
            # Inject the mocked memory instance to ensure it uses the same collection/mock
            sentinel.memory = memory
            
            # Manually save signal so it has an ID
            session.add(signal)
            await session.commit()
            await session.refresh(signal)
            
            # Process
            alert = await sentinel.process_signal(signal)
            
            if alert:
                print("\n✅ ALERT GENERATED!")
                print(f"Title: {alert.title}")
                print(f"Message: {alert.message}")
                print(f"Similarity: {alert.similarity_score:.2f}")
            else:
                print("\n❌ No alert generated (Similarity too low?)")

    await close_db()

if __name__ == "__main__":
    asyncio.run(test_sentinel_flow())
