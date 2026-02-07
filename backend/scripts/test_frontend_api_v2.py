import urllib.request
import json
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"
SYMBOL = "AAPL"

def make_request(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print(json.dumps(data, indent=2))
                return data
            else:
                print(f"Error {response.status}: {response.read().decode()}")
                return None
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def main():
    print("🚀 Testing Frontend Integration Endpoints...")

    # 1. Market Data
    print("\n[1] Testing Market Data (Alpaca Proxy)...")
    
    # 1.1 Quote
    print(f"\n--- GET /market/quote/{SYMBOL} ---")
    quote = make_request(f"{BASE_URL}/market/quote/{SYMBOL}")
    
    # 1.2 History (Candles)
    if quote:
        print(f"\n--- GET /market/history/{SYMBOL} ---")
        make_request(f"{BASE_URL}/market/history/{SYMBOL}?timeframe=1d&limit=5")

    # 2. Portfolio History
    print("\n[2] Testing Portfolio History...")
    print("\n--- GET /portfolio/history ---")
    make_request(f"{BASE_URL}/portfolio/history?timeframe=1M")

    # 3. Real-Time Updates
    print("\n[3] Testing Real-Time Updates...")
    
    # 3.1 Recent Signals
    print("\n--- GET /signals/recent ---")
    make_request(f"{BASE_URL}/signals/recent?limit=3")
    
    # 3.2 Polling Updates (Since 24 hours ago)
    yesterday_ts = time.time() - 86400
    print(f"\n--- GET /updates/since (ts={int(yesterday_ts)}) ---")
    make_request(f"{BASE_URL}/updates/since?timestamp={yesterday_ts}")

if __name__ == "__main__":
    main()
