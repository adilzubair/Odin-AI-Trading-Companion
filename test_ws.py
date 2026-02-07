
import asyncio
import json
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger("ws_test")

async def test_websocket():
    uri = "ws://localhost:8000/ws/market"
    logger.info(f"Connecting to {uri}...")
    
    try:
        try:
            import websockets
        except ImportError:
            logger.error("websockets package not found. Please install it with: pip install websockets")
            sys.exit(1)

        async with websockets.connect(uri) as websocket:
            logger.info("✅ Connected successfully!")
            
            # subscribe
            msg = {"type": "subscribe", "tickers": ["AAPL"]}
            logger.info(f"Sending: {msg}")
            await websocket.send(json.dumps(msg))
            
            # Wait for response
            response = await websocket.recv()
            logger.info(f"Received: {response}")
            
            # Wait for a price update (timeout 5s)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                logger.info(f"Received price update: {response}")
                logger.info("✅ WebSocket is working perfectly!")
            except asyncio.TimeoutError:
                logger.warning("⚠️ No price update received in 5 seconds (Market closed or streaming disabled?)")
            
    except Exception as e:
        logger.error(f"❌ Connection failed: {e}")
        # Check if it's a connection refused
        if "Connection refused" in str(e):
            logger.error("Make sure the backend is running on port 8000!")

if __name__ == "__main__":
    if sys.version_info < (3, 7):
        print("Python 3.7+ required")
        sys.exit(1)
        
    try:
        asyncio.run(test_websocket())
    except KeyboardInterrupt:
        pass
