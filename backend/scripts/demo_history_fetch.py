
import asyncio
import os
import sys
from datetime import datetime
from sqlalchemy import text

# Add project root to path
sys.path.append(os.getcwd())

from app.services.autonomous_service import gather_signals_job
from app.models.database import UserActivity, Alert, Signal
from app.core.database import AsyncSessionLocal

async def demo_history_fetch():
    print("\n--- DEMO: Sentinel History-Based Fetch ---")
    
    async with AsyncSessionLocal() as db:
        # 1. Seed History with a Niche Stock (IREN)
        # We pretend the user traded this before
        print("[1] Seeding User History with 'IREN' (Niche Stock)...")
        activity = UserActivity(
            user_id="demo_user",
            activity_type="trade_attempt",
            symbol="IREN",
            side="buy",
            news_context="IREN expands data centers",
            timestamp=datetime.utcnow()
        )
        db.add(activity)
        await db.commit()
        
        # 2. Run the Signal Gathering Job
        # This should now:
        # a) Gather Trending (SPY, NVDA, etc.)
        # b) NOTICE 'IREN' in history
        # c) Active Fetch 'IREN'
        # d) Run Sentinel on ALL of them
        print("\n[2] Triggering 'run_signal_gathering_job'...")
        await gather_signals_job(db)
        
        # 3. Verify Results
        print("\n[3] Verifying IREN was fetched & checked...")
        
        # Check Signals
        stmt = text("SELECT count(*) FROM signals WHERE symbol = 'IREN'")
        result = await db.execute(stmt)
        count = result.scalar()
        if count > 0:
            print(f"✅ SUCCESS: System automatically fetched {count} signals for IREN!")
        else:
            print("❌ FAILURE: Zero signals found for IREN. Automatic fetch failed.")
            
        # Check Alerts (Optional, depends on similarity)
        # We just want to prove the fetch happened
        
    print("\n--- Demo Complete ---")

if __name__ == "__main__":
    asyncio.run(demo_history_fetch())
