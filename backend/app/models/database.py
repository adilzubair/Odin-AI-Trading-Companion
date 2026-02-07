"""
SQLAlchemy database models.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func

from app.core.database import Base


class Signal(Base):
    """Social media signals and sentiment data."""
    
    __tablename__ = "signals"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), nullable=False, index=True)
    source = Column(String(50), nullable=False)
    source_detail = Column(String(100))
    sentiment = Column(Float, nullable=False)
    raw_sentiment = Column(Float)
    volume = Column(Integer)
    freshness = Column(Float)
    source_weight = Column(Float)
    reason = Column(Text)
    timestamp = Column(DateTime, nullable=False, index=True)
    meta_data = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())


class Position(Base):
    """Trading positions."""
    
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), nullable=False, index=True)
    entry_time = Column(DateTime, nullable=False)
    entry_price = Column(Float)
    entry_sentiment = Column(Float)
    entry_social_volume = Column(Integer)
    entry_reason = Column(Text)
    exit_time = Column(DateTime)
    exit_price = Column(Float)
    exit_reason = Column(Text)
    quantity = Column(Float)
    status = Column(String(20), default="open", index=True)  # 'open', 'closed'
    pnl = Column(Float)
    meta_data = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AnalysisResult(Base):
    """Stored analysis results from TradingAgents."""
    
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), nullable=False, index=True)
    trade_date = Column(String(20), nullable=False)
    market_report = Column(Text)
    sentiment_report = Column(Text)
    news_report = Column(Text)
    fundamentals_report = Column(Text)
    investment_debate = Column(JSON)
    trader_decision = Column(Text)
    risk_debate = Column(JSON)
    final_decision = Column(String(10))  # 'BUY', 'HOLD', 'SELL'
    confidence = Column(Float)
    full_state = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())


class TradingConfig(Base):
    """Trading configuration."""
    
    __tablename__ = "trading_config"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    mode = Column(String(20), default="analysis")  # 'analysis', 'autonomous'
    max_positions = Column(Integer, default=5)
    max_position_value = Column(Float, default=5000.0)
    min_sentiment_score = Column(Float, default=0.3)
    min_analyst_confidence = Column(Float, default=0.6)
    take_profit_pct = Column(Float, default=10.0)
    stop_loss_pct = Column(Float, default=5.0)
    enabled = Column(Boolean, default=False)
    config_json = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Trade(Base):
    """Trade execution history."""
    
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    position_id = Column(Integer, index=True)
    symbol = Column(String(10), nullable=False, index=True)
    side = Column(String(10), nullable=False)  # 'buy', 'sell'
    quantity = Column(Float, nullable=False)
    price = Column(Float)
    order_type = Column(String(20))
    status = Column(String(20))
    alpaca_order_id = Column(String(100))
    executed_at = Column(DateTime)
    meta_data = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())


class Log(Base):
    """System logs."""
    
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    agent = Column(String(50))
    action = Column(String(100))
    level = Column(String(20), default="INFO")
    message = Column(Text)
    meta_data = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())


class UserActivity(Base):
    """Tracks manual user interactions for psychological profiling."""
    
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, default="default_user")
    activity_type = Column(String(50), nullable=False, index=True)  # "trade_attempt", "chart_view", "news_click"
    symbol = Column(String(10), index=True)
    
    # Trade specific details
    side = Column(String(10))  # "buy", "sell"
    quantity = Column(Float)
    price_at_action = Column(Float)
    leverage = Column(Float, default=1.0)
    
    # Context snapshots
    sentiment_score = Column(Float)  # Automated sentiment at that moment
    news_context = Column(Text)  # Summary of news context
    technical_context = Column(Text)  # Summary of technical indicators
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    outcome = Column(Text)  # Filled later (e.g., "Profit: +5%")
    meta_data = Column(JSON)


class Alert(Base):
    """
    Generated alerts from the Sentinel service.
    Connects current news signals to past user behavior.
    """
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, default="default_user")
    title = Column(String(200))
    message = Column(Text)
    alert_type = Column(String(50)) # "pattern_match", "risk_warning", etc.
    
    # Link to source/reason
    signal_id = Column(Integer, index=True, nullable=True) # ID of the news signal
    matched_activity_id = Column(Integer, index=True, nullable=True) # ID of historical action
    
    similarity_score = Column(Float)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    meta_data = Column(JSON)


class MonitoredTicker(Base):
    """
    User configured watchlist.
    Tickers here are analyzed automatically by the agent swarm.
    """
    __tablename__ = "monitored_tickers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, default="default_user")
    symbol = Column(String(10), index=True)
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Configuration for the agents
    analysis_interval = Column(String(20), default="daily") # daily, hourly
    last_analyzed_at = Column(DateTime, nullable=True)
    meta_data = Column(JSON)


class PortfolioConfig(Base):
    """
    Configuration for Autonomous Trading.
    Controls budget, risk parameters, and active status.
    """
    __tablename__ = "portfolio_config"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, index=True, default="default_user")
    is_autonomous_active = Column(Boolean, default=False)
    
    # Budget Controls
    total_budget = Column(Float, default=1000.0) # Allocated capital for bot
    current_allocation = Column(Float, default=0.0) # Amount currently in trades
    
    # Risk Controls
    max_position_size = Column(Float, default=100.0) # Max $ per trade
    max_drawdown = Column(Float, default=0.10) # Stop trading if loss > 10%
    
    # Advanced Controls (Frontend)
    risk_tolerance = Column(String(20), default="medium") # low, medium, high
    allowed_symbols = Column(JSON, default=list) # List[str] e.g. ["AAPL", "NVDA"]
    min_confidence_threshold = Column(Float, default=0.7)
    
    strategy_name = Column(String(50), default="standard")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PortfolioSnapshot(Base):
    """
    Historical snapshot of portfolio value for charting.
    """
    __tablename__ = "portfolio_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, default="default_user")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    total_equity = Column(Float) # Cash + Market Value of Positions
    cash_balance = Column(Float)
    positions_value = Column(Float)
    pnl_daily = Column(Float)
    pnl_all_time = Column(Float)
    
    meta_data = Column(JSON)

