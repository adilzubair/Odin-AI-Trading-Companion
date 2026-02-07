from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta
import logging
from typing import Optional, List, Dict, Any

from app.models.database import UserActivity, Signal
from app.models.trading import UserActionCreate
from app.services.signal_service import SignalService
from app.services.news_service import NewsService

from app.services.memory_service import UserHistoryMemory

logger = logging.getLogger(__name__)

class ObserverService:
    """
    The Observer: Tracks user behavior and captures the 'Why' behind actions.
    Enriches raw user clicks with market context (Sentiment, News) at that exact moment.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.signal_service = SignalService(db)
        self.news_service = NewsService()
        self.memory = UserHistoryMemory()

    async def log_action(self, action: UserActionCreate, user_id: str = "default_user") -> UserActivity:
        """
        Log a user action and attach current market context.
        """
        # 1. Capture Current Context (Snapshot of the market now)
        context = await self._get_market_context(action.symbol)
        
        # 2. Create Activity Record
        activity = UserActivity(
            user_id=user_id,
            activity_type=action.activity_type,
            symbol=action.symbol,
            side=action.side,
            quantity=action.quantity,
            leverage=action.leverage,
            
            # Enriched Context
            sentiment_score=context.get("sentiment"),
            news_context=context.get("news_summary"),
            technical_context=action.client_context, # Passed from frontend
            meta_data=action.meta_data
        )
        
        self.db.add(activity)
        await self.db.commit()
        await self.db.refresh(activity)
        
        # 3. Add to Memory (Async in production, sync here for simplicity)
        try:
            # Create a descriptive text for the memory
            memory_text = f"User {action.activity_type} on {action.symbol}. "
            if action.side:
                memory_text += f"Side: {action.side}. "
            memory_text += f"Context: {context.get('news_summary')}. Sentiment: {context.get('sentiment')}."
            
            self.memory.add_activity(
                activity_text=memory_text,
                metadata={
                    "activity_id": activity.id,
                    "symbol": activity.symbol,
                    "activity_type": activity.activity_type,
                    "timestamp": activity.timestamp.isoformat()
                }
            )
        except Exception as e:
            logger.error(f"Failed to add activity to memory: {e}")
        
        logger.info(f"Observer logged action: {action.activity_type} on {action.symbol} (Sentiment: {format(context.get('sentiment') or 0, '.2f')})")
        
        return activity

    async def _get_market_context(self, symbol: str) -> Dict[str, Any]:
        """
        Fetch the 'Atmosphere' of the market for this symbol right now.
        Returns sentiment score and latest signal reasons.
        """
        # Get signals from last 24 hours
        yesterday = datetime.utcnow() - timedelta(hours=24)
        
        result = await self.db.execute(
            select(Signal)
            .where(Signal.symbol == symbol)
            .where(Signal.timestamp >= yesterday)
            .order_by(desc(Signal.timestamp))
            .limit(5)
        )
        signals = result.scalars().all()
        
        # 1. Fetch live news context from the web (The "Why")
        # User requested specific API call to get "latest news" instead of relying only on cached signals
        news_summary = ""
        try:
            news_summary = await self.news_service.get_latest_news(symbol)
        except Exception as e:
            logger.error(f"Failed to fetch live news for context: {e}")
            news_summary = "Live news fetch failed."

        # 2. Get automated sentiment (The "Data")
        if not signals:
            # Fallback: Active Fetch (for niche stocks like IREN)
            try:
                # We still keep this to populate the DB with raw data
                logger.info(f"No cached signals for {symbol}. Triggering active fetch...")
                signals = await self.signal_service.fetch_signals_for_ticker(symbol)
            except Exception as e:
                logger.warning(f"Active fetch fallback failed: {e}")
        
        avg_sentiment = 0.0
        if signals:
             avg_sentiment = sum(s.sentiment for s in signals) / len(signals)
        
        return {
            "sentiment": avg_sentiment,
            "news_summary": news_summary # Now populated by Live Web Search
        }

    async def get_history(self, user_id: str, limit: int = 50) -> List[UserActivity]:
        """Retrieve user history."""
        result = await self.db.execute(
            select(UserActivity)
            .where(UserActivity.user_id == user_id)
            .order_by(desc(UserActivity.timestamp))
            .limit(limit)
        )
        return result.scalars().all()
