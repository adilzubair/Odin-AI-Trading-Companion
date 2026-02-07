from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import logging

from app.services.alpaca_service import AlpacaService
from app.core.security import verify_api_key
from fastapi import Depends

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/market/quote/{symbol}")
async def get_market_quote(
    symbol: str,
    # api_key: str = Depends(verify_api_key) # Optional: secure if needed
):
    """
    Get real-time quote for a symbol.
    Proxies to Alpaca Data API.
    """
    try:
        alpaca = AlpacaService()
        quote = await alpaca.get_latest_quote(symbol)
        
        if not quote:
            raise HTTPException(status_code=404, detail=f"Quote not found for {symbol}")
            
        return quote
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market/history/{symbol}")
async def get_market_history(
    symbol: str,
    timeframe: str = Query("1d", description="Timeframe: 1m, 5m, 15m, 1h, 1d"),
    limit: int = Query(100, description="Number of candles to return"),
    # api_key: str = Depends(verify_api_key)
):
    """
    Get historical OHLCV data for charts.
    """
    try:
        alpaca = AlpacaService()
        bars = await alpaca.get_historical_bars(symbol, timeframe, limit)
        
        if not bars:
            # Return empty list instead of 404 for charts
            return {"symbol": symbol, "data": []}
            
        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "data": bars
        }
    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Stock name mapping for popular stocks
STOCK_NAMES = {
    "AAPL": "Apple Inc.",
    "GOOGL": "Alphabet Inc.",
    "MSFT": "Microsoft Corp.",
    "AMZN": "Amazon.com Inc.",
    "TSLA": "Tesla Inc.",
    "NVDA": "NVIDIA Corp.",
    "META": "Meta Platforms Inc.",
    "AMD": "Advanced Micro Devices",
    "NFLX": "Netflix Inc.",
    "SPY": "SPDR S&P 500 ETF",
}

POPULAR_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "AMD"]


@router.get("/market/popular")
async def get_popular_stocks():
    """
    Get real-time quotes for popular stocks.
    Returns stock data with prices suitable for the frontend.
    """
    try:
        alpaca = AlpacaService()
        stocks = []
        
        for symbol in POPULAR_SYMBOLS:
            try:
                quote = await alpaca.get_latest_quote(symbol)
                if quote:
                    # Calculate mid price and change
                    bid = quote.get("bid_price", 0)
                    ask = quote.get("ask_price", 0)
                    mid_price = (bid + ask) / 2 if bid and ask else bid or ask
                    
                    # Get historical data for change calculation
                    bars = await alpaca.get_historical_bars(symbol, "1d", 2)
                    change_pct = 0.0
                    if bars and len(bars) >= 2:
                        prev_close = bars[-2].get("close", mid_price)
                        if prev_close > 0:
                            change_pct = ((mid_price - prev_close) / prev_close) * 100
                    
                    stocks.append({
                        "ticker": symbol,
                        "name": STOCK_NAMES.get(symbol, symbol),
                        "price": round(mid_price, 2),
                        "changePercentage": round(change_pct, 2),
                        "miniChartData": []  # Frontend will fetch separately if needed
                    })
            except Exception as e:
                logger.warning(f"Failed to fetch quote for {symbol}: {e}")
                continue
        
        return stocks
    except Exception as e:
        logger.error(f"Error fetching popular stocks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market/detail/{symbol}")
async def get_stock_detail(symbol: str):
    """
    Get detailed stock information for the trade detail page.
    Includes current price, change, and chart data.
    """
    try:
        alpaca = AlpacaService()
        symbol = symbol.upper()
        
        # Get current quote
        quote = await alpaca.get_latest_quote(symbol)
        if not quote:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
        
        bid = quote.get("bid_price", 0)
        ask = quote.get("ask_price", 0)
        current_price = (bid + ask) / 2 if bid and ask else bid or ask
        
        # Get historical data for change calculation and chart
        bars = await alpaca.get_historical_bars(symbol, "1d", 30)
        
        change = 0.0
        change_pct = 0.0
        if bars and len(bars) >= 2:
            prev_close = bars[-2].get("close", current_price)
            change = current_price - prev_close
            if prev_close > 0:
                change_pct = (change / prev_close) * 100
        
        # Build chart data from historical bars
        chart_data = {}
        if bars:
            chart_data["1d"] = [
                {"timestamp": bar.get("timestamp", i), "value": bar.get("close", 0)}
                for i, bar in enumerate(bars)
            ]
        
        return {
            "ticker": symbol,
            "name": STOCK_NAMES.get(symbol, symbol),
            "price": round(current_price, 2),
            "change": round(change, 2),
            "changePercentage": round(change_pct, 2),
            "chartData": chart_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching stock detail for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
