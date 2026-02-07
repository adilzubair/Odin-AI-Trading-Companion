"""
Configuration management using Pydantic Settings.
"""

from typing import Optional, List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_name: str = "Unified Trading Bot"
    app_version: str = "0.1.0"
    debug: bool = False
    api_prefix: str = "/api/v1"
    
    # Security
    api_key: str = Field(..., description="API key for authentication")
    kill_switch_secret: Optional[str] = Field(None, description="Emergency kill switch secret")
    
    # Database
    database_url: str = Field(
        default="sqlite:///./trading_bot.db",
        description="Database connection URL"
    )
    
    # Alpaca Trading
    alpaca_api_key: str = Field(..., description="Alpaca API key")
    alpaca_api_secret: str = Field(..., description="Alpaca API secret")
    alpaca_paper: bool = Field(default=True, description="Use paper trading")
    alpaca_base_url: Optional[str] = Field(None, description="Alpaca base URL override")
    
    # LLM Configuration
    llm_provider: str = Field(default="openai", description="LLM provider: openai, anthropic, google")
    deep_think_llm: str = Field(default="gpt-4o-mini", description="Model for deep analysis")
    quick_think_llm: str = Field(default="gpt-4o-mini", description="Model for quick tasks")
    openai_api_key: Optional[str] = Field(None, description="OpenAI API key")
    anthropic_api_key: Optional[str] = Field(None, description="Anthropic API key")
    google_api_key: Optional[str] = Field(None, description="Google AI API key")
    backend_url: str = Field(default="https://api.openai.com/v1", description="LLM backend URL")
    
    # Data Sources
    alpha_vantage_api_key: Optional[str] = Field(None, description="Alpha Vantage API key")
    twitter_bearer_token: Optional[str] = Field(None, description="Twitter API bearer token")
    reddit_client_id: Optional[str] = Field(None, description="Reddit client ID")
    reddit_client_secret: Optional[str] = Field(None, description="Reddit client secret")
    reddit_user_agent: str = Field(default="UnifiedTradingBot/0.1", description="Reddit user agent")
    
    # Trading Configuration
    max_positions: int = Field(default=5, description="Maximum concurrent positions")
    max_position_value: float = Field(default=5000.0, description="Maximum $ per position")
    min_sentiment_score: float = Field(default=0.3, description="Minimum sentiment to consider")
    min_analyst_confidence: float = Field(default=0.6, description="Minimum LLM confidence to trade")
    take_profit_pct: float = Field(default=10.0, description="Take profit percentage")
    stop_loss_pct: float = Field(default=5.0, description="Stop loss percentage")
    position_size_pct_of_cash: float = Field(default=25.0, description="% of cash per trade")
    
    # Autonomous Trading
    autonomous_enabled: bool = Field(default=False, description="Enable autonomous trading")
    data_poll_interval_seconds: int = Field(default=30, description="Data gathering interval")
    analyst_interval_seconds: int = Field(default=120, description="Analysis interval")
    
    # Staleness Detection
    stale_position_enabled: bool = Field(default=True, description="Enable staleness detection")
    stale_min_hold_hours: int = Field(default=24, description="Min hours before staleness check")
    stale_max_hold_days: int = Field(default=3, description="Force exit after N days")
    stale_min_gain_pct: float = Field(default=5.0, description="Required gain to hold past max days")
    
    # Options Trading
    options_enabled: bool = Field(default=False, description="Enable options trading")
    options_min_confidence: float = Field(default=0.8, description="Higher threshold for options")
    
    # Crypto Trading
    crypto_enabled: bool = Field(default=False, description="Enable crypto trading")
    crypto_symbols: List[str] = Field(default=["BTC/USD", "ETH/USD"], description="Crypto symbols to trade")
    
    # Testing
    ignore_market_hours: bool = Field(default=False, description="Bypass market hours check (TESTING ONLY!)")
    
    # TradingAgents Configuration
    max_debate_rounds: int = Field(default=1, description="Max debate rounds")
    max_risk_discuss_rounds: int = Field(default=1, description="Max risk discussion rounds")
    data_vendors: dict = Field(
        default={
            "core_stock_apis": "yfinance",
            "technical_indicators": "yfinance",
            "fundamental_data": "alpha_vantage",
            "news_data": "alpha_vantage",
        },
        description="Data vendor configuration"
    )
    
    # Rate Limiting
    rate_limit_per_minute: int = Field(default=60, description="API rate limit per minute")
    
    def get_tradingagents_config(self) -> dict:
        """Get configuration dict for TradingAgents."""
        import os
        
        # Get the agents directory path
        agents_dir = os.path.join(os.path.dirname(__file__), 'agents', 'tradingagents')
        
        return {
            "project_dir": agents_dir,
            "data_cache_dir": os.path.join(agents_dir, "dataflows/data_cache"),
            "results_dir": "./results",
            "llm_provider": self.llm_provider,
            "deep_think_llm": self.deep_think_llm,
            "quick_think_llm": self.quick_think_llm,
            "backend_url": self.backend_url,
            "max_debate_rounds": self.max_debate_rounds,
            "max_risk_discuss_rounds": self.max_risk_discuss_rounds,
            "data_vendors": self.data_vendors,
        }


# Global settings instance
settings = Settings()
