import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from app.core.database import init_db, close_db, AsyncSessionLocal
from app.services.autonomous_service import AutonomousService

async def test_autopilot_controls():
    await init_db()
    
    async with AsyncSessionLocal() as session:
        service = AutonomousService(session)
        
        # 1. Update Config (Set low budget to trigger guardrail)
        print("⚙️ Updating Portfolio Config (Budget: $100)")
        config = await service.update_portfolio_config({
            "is_autonomous_active": True,
            "total_budget": 100.0,
            "max_position_size": 200.0, # Position size > Budget (Should fail budget check)
            "current_allocation": 0.0
        })
        print(f"✅ Config Active: {config.is_autonomous_active}, Budget: ${config.total_budget}")
        
        # 2. Test Guardrail (Should FAIL due to budget)
        print("🛡️ Testing Guardrail: Attempting $150 trade (Budget: $100)...")
        is_safe = await service._check_guardrails("AAPL", 1, 150.0)
        
        if not is_safe:
            print("✅ Guardrail correctly BLOCKED the trade (Budget Exceeded).")
        else:
            print("❌ Guardrail FAILED to block trade!")
            
        # 3. Test Guardrail (Should PASS)
        print("🛡️ Testing Guardrail: Attempting $50 trade (Budget: $100)...")
        is_safe_pass = await service._check_guardrails("AAPL", 1, 50.0)
        
        if is_safe_pass:
             print("✅ Guardrail correctly ALLOWED the trade.")
        else:
             print("❌ Guardrail incorrectly blocked safe trade!")

    await close_db()

if __name__ == "__main__":
    asyncio.run(test_autopilot_controls())
