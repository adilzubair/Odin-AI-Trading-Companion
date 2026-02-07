
import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from app.services.signal_service import SignalService

# Mock DB Session
class MockDB:
    def add(self, obj):
        print(f"   [MockDB] Adding object: {obj}")
    
    async def commit(self):
        print("   [MockDB] Committing transaction...")
        
    async def refresh(self, obj):
        pass

async def demo_real_fetch():
    print("\n--- DEMO: Real-Time Context Fetch ---")
    print("Connecting to public StockTwits API (with Browser User-Agent)...")
    
    # Use our Mock DB
    mock_db = MockDB()
    service = SignalService(mock_db)
    
    # Let's try a couple of tickers that usually have high volume
    tickers = ["SPY", "NVDA", "TSLA"]
    
    for ticker in tickers:
        print(f"\n[1] Hunting signals for ${ticker}...")
        try:
            signals = await service.fetch_signals_for_ticker(ticker)
            
            if signals:
                print(f"✅ Success! Found {len(signals)} signal object.")
                signal = signals[0]
                print(f"   Shape of Data Captured:")
                print(f"   - Sentiment Score: {signal.sentiment:.2f}")
                print(f"   - Volume: {signal.volume} messages analyzed")
                print(f"   - THE 'WHY' (Rich Content): \n     \"{signal.meta_data.get('top_content')}\"")
                print(f"   - Reason Field: {signal.reason}")
            else:
                print("❌ No signals found (Active fetch returned empty).")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(demo_real_fetch())
