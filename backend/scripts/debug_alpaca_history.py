import os
import sys
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config import settings

from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

def debug_history():
    api_key = settings.alpaca_api_key
    secret_key = settings.alpaca_api_secret
    
    if not api_key:
        print("Error: ALPACA_API_KEY not found in settings")
        return

    client = StockHistoricalDataClient(api_key, secret_key)
    
    symbol = "AAPL"
    
    try:
        req = StockBarsRequest(
            symbol_or_symbols=symbol,
            timeframe=TimeFrame.Day,
            limit=5
        )
        bars = client.get_stock_bars(req)
        print(f"Type of bars: {type(bars)}")
        print(f"Dir(bars): {dir(bars)}")
        # If it's a dict, print keys
        if hasattr(bars, "keys"):
             print(f"Keys: {bars.keys()}")
        elif hasattr(bars, "data"):
             print(f"Data type: {type(bars.data)}")
             print(f"Data keys: {bars.data.keys()}")
    except Exception as e:
        print(f"Error: {e}")

    # Try 2: With start date (365 days ago)
    print("\n[2] Testing WITH start date (365 days ago)...")
    try:
        start_time = datetime.utcnow() - timedelta(days=365)
        req = StockBarsRequest(
            symbol_or_symbols=symbol,
            timeframe=TimeFrame.Day,
            limit=5,
            start=start_time
        )
        bars = client.get_stock_bars(req)
        print(f"Result count: {len(bars.get(symbol, []))}")
        for b in bars.get(symbol, []):
            print(f"  {b.timestamp.date()}: {b.close}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_history()
