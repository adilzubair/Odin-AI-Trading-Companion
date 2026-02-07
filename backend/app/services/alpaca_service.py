"""
Alpaca API integration service.
"""

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest, StopLossRequest
from alpaca.trading.enums import OrderSide, TimeInForce, OrderType
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockLatestQuoteRequest, StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from typing import List, Optional, Dict, Any
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class AlpacaService:
    """Service for interacting with Alpaca API."""
    
    def __init__(self):
        """Initialize Alpaca clients."""
        self.trading_client = TradingClient(
            api_key=settings.alpaca_api_key,
            secret_key=settings.alpaca_api_secret,
            paper=settings.alpaca_paper,
            url_override=settings.alpaca_base_url
        )
        
        self.data_client = StockHistoricalDataClient(
            api_key=settings.alpaca_api_key,
            secret_key=settings.alpaca_api_secret
        )
        
        logger.info(f"Alpaca service initialized (paper={settings.alpaca_paper})")
    
    async def get_account(self) -> Dict[str, Any]:
        """Get account information."""
        try:
            account = self.trading_client.get_account()
            return {
                "cash": float(account.cash),
                "portfolio_value": float(account.portfolio_value),
                "buying_power": float(account.buying_power),
                "equity": float(account.equity),
                "status": account.status,
            }
        except Exception as e:
            logger.error(f"Failed to get account: {e}")
            raise
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get all open positions."""
        try:
            positions = self.trading_client.get_all_positions()
            return [
                {
                    "symbol": pos.symbol,
                    "quantity": float(pos.qty),
                    "avg_entry_price": float(pos.avg_entry_price),
                    "current_price": float(pos.current_price),
                    "market_value": float(pos.market_value),
                    "unrealized_pl": float(pos.unrealized_pl),
                    "unrealized_plpc": float(pos.unrealized_plpc),
                }
                for pos in positions
            ]
        except Exception as e:
            logger.error(f"Failed to get positions: {e}")
            raise
    
    async def get_position(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get position for a specific symbol."""
        try:
            pos = self.trading_client.get_open_position(symbol)
            return {
                "symbol": pos.symbol,
                "quantity": float(pos.qty),
                "avg_entry_price": float(pos.avg_entry_price),
                "current_price": float(pos.current_price),
                "market_value": float(pos.market_value),
                "unrealized_pl": float(pos.unrealized_pl),
                "unrealized_plpc": float(pos.unrealized_plpc),
            }
        except Exception as e:
            logger.debug(f"No position found for {symbol}: {e}")
            return None
    
    async def get_latest_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get latest quote for a symbol."""
        try:
            request = StockLatestQuoteRequest(symbol_or_symbols=symbol)
            quotes = self.data_client.get_stock_latest_quote(request)
            quote = quotes[symbol]
            return {
                "symbol": symbol,
                "bid_price": float(quote.bid_price),
                "ask_price": float(quote.ask_price),
                "bid_size": quote.bid_size,
                "ask_size": quote.ask_size,
            }
        except Exception as e:
            logger.error(f"Failed to get quote for {symbol}: {e}")
            return None
    
    async def place_market_order(
        self,
        symbol: str,
        quantity: float,
        side: str = "buy"
    ) -> Dict[str, Any]:
        """Place a market order."""
        try:
            order_side = OrderSide.BUY if side.lower() == "buy" else OrderSide.SELL
            
            # Crypto requires GTC (Good-Til-Cancelled), stocks use DAY
            is_crypto = any(crypto in symbol.upper() for crypto in ['BTC', 'ETH', 'USD', 'USDT'])
            time_in_force = TimeInForce.GTC if is_crypto else TimeInForce.DAY
            
            order_data = MarketOrderRequest(
                symbol=symbol,
                qty=quantity,
                side=order_side,
                time_in_force=time_in_force
            )
            
            order = self.trading_client.submit_order(order_data)
            
            logger.info(f"Market order placed: {side} {quantity} {symbol} (TIF: {time_in_force})")
            return {
                "order_id": str(order.id),
                "symbol": order.symbol,
                "side": order.side.value,
                "quantity": float(order.qty),
                "status": order.status.value,
                "created_at": order.created_at.isoformat() if order.created_at else None,
            }
        except Exception as e:
            logger.error(f"Failed to place market order for {symbol}: {e}")
            raise
    
    async def close_position(
        self,
        symbol: str,
        quantity: Optional[float] = None
    ) -> Dict[str, Any]:
        """Close a position (fully or partially)."""
        try:
            if quantity:
                # Partial close
                order = self.trading_client.close_position(symbol, qty=str(quantity))
            else:
                # Full close
                order = self.trading_client.close_position(symbol)
            
            logger.info(f"Position closed: {symbol} (qty={quantity or 'all'})")
            return {
                "order_id": str(order.id),
                "symbol": order.symbol,
                "status": order.status.value,
            }
        except Exception as e:
            logger.error(f"Failed to close position {symbol}: {e}")
            raise
    
    async def cancel_all_orders(self):
        """Cancel all open orders."""
        try:
            result = self.trading_client.cancel_orders()
            logger.info(f"Cancelled {len(result)} orders")
            return {"cancelled": len(result)}
        except Exception as e:
            logger.error(f"Failed to cancel orders: {e}")
            raise
    
    async def get_market_clock(self) -> Dict[str, Any]:
        """Get market clock information."""
        try:
            clock = self.trading_client.get_clock()
            return {
                "is_open": clock.is_open,
                "next_open": clock.next_open.isoformat() if clock.next_open else None,
                "next_close": clock.next_close.isoformat() if clock.next_close else None,
            }
        except Exception as e:
            logger.error(f"Failed to get market clock: {e}")
            raise

    async def get_historical_bars(self, symbol: str, timeframe: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get historical OHLCV data for charts.
        
        Args:
            symbol: Ticker symbol
            timeframe: '1m', '5m', '15m', '1h', '1d'
            limit: Number of bars
        """
        try:
            from datetime import datetime, timedelta
            
            # Map timeframe string to Alpaca TimeFrame
            tf_map = {
                "1m": TimeFrame.Minute,
                "5m": TimeFrame(5, TimeFrame.Minute),
                "15m": TimeFrame(15, TimeFrame.Minute),
                "1h": TimeFrame.Hour,
                "1d": TimeFrame.Day,
            }
            tf = tf_map.get(timeframe, TimeFrame.Day)
            
            # Default to 365 days ago if no start date provided (to ensure data found)
            start_time = datetime.utcnow() - timedelta(days=365)
            
            request = StockBarsRequest(
                symbol_or_symbols=symbol,
                timeframe=tf,
                limit=limit,
                start=start_time
            )
            bars = self.data_client.get_stock_bars(request)
            
            # Extract data for the requested symbol
            # bars is a BarSet object, bars.data is a dict {symbol: [Bar, ...]}
            # We access .data to get the dictionary
            symbol_bars = bars.data.get(symbol, [])
            
            return [
                {
                    "timestamp": b.timestamp.isoformat(),
                    "open": b.open,
                    "high": b.high,
                    "low": b.low,
                    "close": b.close,
                    "volume": b.volume
                }
                for b in symbol_bars
            ]
        except Exception as e:
            logger.error(f"Failed to get bars for {symbol}: {e}")
            return []
