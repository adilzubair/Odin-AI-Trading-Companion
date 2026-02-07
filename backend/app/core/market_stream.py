"""
Background task for streaming real-time market prices via WebSocket.
Fetches latest prices for subscribed tickers and broadcasts to clients.
"""

import asyncio
import logging
from app.core.websocket_manager import manager
from app.services.alpaca_service import AlpacaService

logger = logging.getLogger(__name__)


async def stream_market_prices():
    """
    Background task to stream real-time prices to WebSocket clients.
    Runs continuously, fetching prices for all subscribed tickers.
    """
    logger.info("Starting market price streaming task...")
    
    # Reuse AlpacaService instance to avoid creating too many connections
    alpaca = AlpacaService()
    error_count = 0
    last_error_log_time = 0
    
    while True:
        try:
            # Get all tickers that clients are subscribed to
            subscribed_tickers = manager.get_all_subscribed_tickers()
            
            if not subscribed_tickers:
                # No subscriptions, wait before checking again
                await asyncio.sleep(2)
                continue
            
            # Fetch latest prices for all subscribed tickers in parallel
            async def fetch_price(ticker: str):
                """Fetch latest quote for a single ticker."""
                try:
                    quote = await alpaca.get_latest_quote(ticker)
                    
                    if quote:
                        bid = quote.get("bid_price", 0)
                        ask = quote.get("ask_price", 0)
                        mid_price = (bid + ask) / 2 if bid and ask else bid or ask
                        
                        return ticker, {
                            "price": round(mid_price, 2),
                            "bid": round(bid, 2),
                            "ask": round(ask, 2),
                            "timestamp": quote.get("timestamp", "")
                        }
                    return ticker, None
                except Exception as e:
                    # Rate-limit error logging to prevent spam
                    import time
                    current_time = time.time()
                    nonlocal error_count, last_error_log_time
                    error_count += 1
                    
                    # Only log every 10 seconds
                    if current_time - last_error_log_time > 10:
                        logger.warning(f"Errors fetching prices (count: {error_count}). Last error for {ticker}: {e}")
                        last_error_log_time = current_time
                        error_count = 0
                    
                    return ticker, None
            
            # Fetch all prices in parallel
            results = await asyncio.gather(
                *[fetch_price(ticker) for ticker in subscribed_tickers],
                return_exceptions=True
            )
            
            # Broadcast updates to subscribers
            broadcast_count = 0
            for result in results:
                if isinstance(result, Exception):
                    continue
                
                ticker, data = result
                if data:
                    await manager.broadcast_price_update(ticker, data)
                    broadcast_count += 1
            
            # Log successful broadcasts occasionally (every 30 seconds)
            import time
            if broadcast_count > 0 and int(time.time()) % 30 == 0:
                logger.debug(f"Broadcasting prices for {broadcast_count} tickers to {manager.get_connection_count()} clients")
            
            # Update every 2 seconds (reduced from 1 to lower load)
            await asyncio.sleep(2)
        
        except Exception as e:
            logger.error(f"Critical error in price streaming task: {e}", exc_info=True)
            await asyncio.sleep(10)  # Wait longer on critical error


async def start_market_stream():
    """Start the background price streaming task."""
    import asyncio
    asyncio.create_task(stream_market_prices())
    logger.info("Market price streaming task started")
