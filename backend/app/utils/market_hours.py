"""
Market hours and crypto trading utilities.
"""
from datetime import datetime, time
import pytz


def is_market_open() -> bool:
    """
    Check if US stock market is currently open.
    
    Returns:
        bool: True if market is open, False otherwise
    """
    # Get current time in US Eastern
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    
    # Market is closed on weekends
    if now.weekday() >= 5:  # Saturday = 5, Sunday = 6
        return False
    
    # Market hours: 9:30 AM - 4:00 PM ET
    market_open = time(9, 30)
    market_close = time(16, 0)
    current_time = now.time()
    
    return market_open <= current_time <= market_close


def is_crypto_symbol(symbol: str) -> bool:
    """
    Check if a symbol is a cryptocurrency.
    
    Args:
        symbol: Trading symbol
        
    Returns:
        bool: True if crypto, False otherwise
    """
    # Common crypto symbols
    crypto_symbols = {
        'BTC', 'BTCUSD', 'BTC/USD', 'BITCOIN',
        'ETH', 'ETHUSD', 'ETH/USD', 'ETHEREUM',
        'DOGE', 'DOGEUSD', 'DOGE/USD',
        'LTC', 'LTCUSD', 'LTC/USD',
        'BCH', 'BCHUSD', 'BCH/USD',
        'XRP', 'XRPUSD', 'XRP/USD',
        'ADA', 'ADAUSD', 'ADA/USD',
        'SOL', 'SOLUSD', 'SOL/USD',
        'MATIC', 'MATICUSD', 'MATIC/USD',
        'AVAX', 'AVAXUSD', 'AVAX/USD',
    }
    
    # Check if symbol or base symbol is in crypto list
    symbol_upper = symbol.upper()
    return symbol_upper in crypto_symbols or symbol_upper.endswith('USD')


def can_trade_symbol(symbol: str, ignore_market_hours: bool = False) -> tuple[bool, str]:
    """
    Check if a symbol can be traded right now.
    
    Args:
        symbol: Trading symbol
        ignore_market_hours: If True, bypass market hours check (for testing)
        
    Returns:
        tuple: (can_trade: bool, reason: str)
    """
    if is_crypto_symbol(symbol):
        return True, "Crypto markets are open 24/7"
    
    if ignore_market_hours:
        return True, "Market hours check bypassed (testing mode)"
    
    if is_market_open():
        return True, "Stock market is open"
    
    return False, "Stock market is closed"
