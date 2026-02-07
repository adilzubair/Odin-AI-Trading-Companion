from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
import logging
from datetime import datetime
from typing import List, Optional

from app.models.database import MonitoredTicker
from app.api.analysis import AnalysisService

logger = logging.getLogger(__name__)

class MonitorService:
    """
    Service for managing the user's watchlist and running automated analysis.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        # We will initialize AnalysisService dynamically or pass it as needed
        # to avoid circular dependency issues if any exist.
        
    async def add_ticker(self, symbol: str, interval: str = "daily") -> MonitoredTicker:
        """Add a ticker to the watchlist."""
        symbol = symbol.upper()
        
        # Check if exists
        stmt = select(MonitoredTicker).where(
            MonitoredTicker.symbol == symbol,
            MonitoredTicker.is_active == True
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            return existing
            
        # Create new
        ticker = MonitoredTicker(
            symbol=symbol,
            analysis_interval=interval,
            added_at=datetime.utcnow()
        )
        self.db.add(ticker)
        await self.db.commit()
        await self.db.refresh(ticker)
        
        logger.info(f"Added {symbol} to monitor list")
        return ticker

    async def remove_ticker(self, symbol: str):
        """Remove (deactivate) a ticker."""
        stmt = select(MonitoredTicker).where(MonitoredTicker.symbol == symbol.upper())
        result = await self.db.execute(stmt)
        ticker = result.scalar_one_or_none()
        
        if ticker:
            ticker.is_active = False
            await self.db.commit()

    async def get_watchlist(self) -> List[MonitoredTicker]:
        """Get all active tickers."""
        stmt = select(MonitoredTicker).where(MonitoredTicker.is_active == True)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def run_scheduled_analysis(self):
        """
        CRON JOB FUNCTION:
        Iterates through watchlist and runs Agent Analysis on each.
        """
        logger.info("Running scheduled monitor analysis...")
        
        watchlist = await self.get_watchlist()
        
        if not watchlist:
            logger.info("Watchlist empty. Skipping.")
            return

        # Initialize Analysis Service
        analysis_service = AnalysisService(self.db)
        
        for ticker in watchlist:
            try:
                logger.info(f"Analyzing monitored ticker: {ticker.symbol}...")
                
                # Run the full agent swarm
                # This stores the result in 'AnalysisResult' table automatically
                await analysis_service.run_analysis(
                    ticker=ticker.symbol,
                    save_db=True
                )
                
                # Update last_analyzed timestamp
                ticker.last_analyzed_at = datetime.utcnow()
                await self.db.commit()
                
            except Exception as e:
                logger.error(f"Failed to auto-analyze {ticker.symbol}: {e}")
                continue
                
        logger.info("Scheduled monitor analysis complete.")
