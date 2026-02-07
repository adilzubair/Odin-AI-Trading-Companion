"""
Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Analysis Models
class AnalysisRequest(BaseModel):
    """Request model for running analysis."""
    ticker: str = Field(..., description="Stock ticker symbol")
    date: Optional[str] = Field(None, description="Analysis date (YYYY-MM-DD), defaults to today")
    analysts: List[str] = Field(
        default=["market", "fundamentals", "news", "social"],
        description="List of analysts to include"
    )


class AnalysisResponse(BaseModel):
    """Response model for analysis results."""
    ticker: str
    trade_date: str
    market_report: Optional[str] = None
    sentiment_report: Optional[str] = None
    news_report: Optional[str] = None
    fundamentals_report: Optional[str] = None
    investment_debate: Optional[Dict[str, Any]] = None
    trader_decision: Optional[str] = None
    risk_debate: Optional[Dict[str, Any]] = None
    final_decision: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime


# Autonomous Trading Models
class AutonomousStatus(BaseModel):
    """Autonomous trading status."""
    enabled: bool
    signals_count: int
    open_positions: int
    last_data_gather: Optional[datetime] = None
    last_analysis: Optional[datetime] = None
    account_value: Optional[float] = None
    cash: Optional[float] = None


class TradingConfigUpdate(BaseModel):
    """Update trading configuration."""
    max_positions: Optional[int] = None
    max_position_value: Optional[float] = None
    min_sentiment_score: Optional[float] = None
    min_analyst_confidence: Optional[float] = None
    take_profit_pct: Optional[float] = None
    stop_loss_pct: Optional[float] = None


# Position Models
class PositionResponse(BaseModel):
    """Position information."""
    symbol: str
    quantity: float
    entry_price: Optional[float] = None
    current_price: Optional[float] = None
    entry_time: datetime
    entry_reason: Optional[str] = None
    pnl: Optional[float] = None
    pnl_pct: Optional[float] = None
    status: str


class TradeResponse(BaseModel):
    """Trade execution information."""
    id: int
    symbol: str
    side: str
    quantity: float
    price: Optional[float] = None
    status: str
    executed_at: Optional[datetime] = None
    reason: Optional[str] = None
    source: Optional[str] = "autonomous"
    created_at: datetime


# Signal Models
class SignalResponse(BaseModel):
    """Signal information."""
    symbol: str
    source: str
    sentiment: float
    volume: int
    reason: Optional[str] = None
    timestamp: datetime


# User Activity / Observer Models
class UserActionCreate(BaseModel):
    """Schema for logging a manual user action."""
    activity_type: str = Field(..., description="Type of activity (trade_attempt, chart_view, etc)")
    symbol: str = Field(..., description="Symbol involved")
    side: Optional[str] = None
    quantity: Optional[float] = None
    leverage: Optional[float] = 1.0
    client_context: Optional[str] = Field(None, description="Optional context from frontend (UI state)")
    meta_data: Optional[Dict[str, Any]] = None


class UserActionResponse(BaseModel):
    """Response when an action is logged."""
    id: int
    user_id: str
    symbol: str
    activity_type: str
    sentiment_at_time: Optional[float] = None
    news_context: Optional[str] = None
    timestamp: datetime


# Alert / Sentinel Models
class AlertResponse(BaseModel):
    """Response model for sentinel alerts."""
    id: int
    title: str
    message: str
    alert_type: str
    similarity_score: float
    is_read: bool
    timestamp: datetime
    matched_activity_id: Optional[int] = None


# Portfolio / Auto-Pilot Models
class PortfolioConfigBase(BaseModel):
    is_autonomous_active: Optional[bool] = None
    total_budget: Optional[float] = None
    max_position_size: Optional[float] = None
    max_drawdown: Optional[float] = None
    
    # Advanced
    risk_tolerance: Optional[str] = None
    allowed_symbols: Optional[List[str]] = None
    min_confidence_threshold: Optional[float] = None
    
    strategy_name: Optional[str] = None

class PortfolioConfigUpdate(PortfolioConfigBase):
    pass

class PortfolioConfigResponse(BaseModel):
    id: int
    user_id: str
    is_autonomous_active: bool
    total_budget: float
    current_allocation: float
    max_position_size: float
    max_drawdown: float
    
    risk_tolerance: str
    allowed_symbols: List[str]
    min_confidence_threshold: float
    
    strategy_name: str
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ManualTradeRequest(BaseModel):
    """Request mode for executing a manual trade."""
    symbol: str = Field(..., description="Stock ticker symbol")
    quantity: float = Field(..., gt=0, description="Quantity to buy/sell")
    side: str = Field(..., pattern="^(buy|sell)$", description="Trade side (buy/sell)")
    reason: Optional[str] = Field(None, description="Reason for trade (for logging)")
