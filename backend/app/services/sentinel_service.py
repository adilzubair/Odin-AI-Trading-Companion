from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import logging
from datetime import datetime
from typing import List, Optional

from app.models.database import Signal, Alert, UserActivity
from app.services.memory_service import UserHistoryMemory

logger = logging.getLogger(__name__)

class SentinelService:
    """
    The Sentinel: Proactive pattern matching engine.
    Watches the news stream (Signals) and checks if the user has a relevant history.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.memory = UserHistoryMemory() # Connects to ChromaDB

    async def process_signal(self, signal: Signal) -> Optional[Alert]:
        """
        Check a new signal against user history. 
        If a strong correlation is found, generate an Alert.
        """
        try:
            # 1. Construct query for memory
            # "News about [Symbol]: [Reason]"
            query_text = f"News about {signal.symbol}: {signal.reason}. {signal.source_detail or ''}"
            
            # 2. Query Memory
            matches = self.memory.find_similar_situations(query_text, n_matches=1)
            
            if not matches:
                return None
            
            best_match = matches[0]
            similarity = best_match['similarity_score']
            
            # Threshold for alerting (adjustable)
            if similarity < 0.35: # Conservative threshold for demo
                return None
                
            # 3. Analyze the match
            history_metadata = best_match['metadata']
            activity_type = history_metadata.get('activity_type')
            
            # 4. Generate Alert Content
            title = f"Proactive Alert: {signal.symbol}"
            message = (
                f"This news event matches your history (Similarity: {similarity:.2f}).\n"
                f"Last time a similar event occurred, you performed a '{activity_type}' action.\n"
                f"Do you want to review the setup?"
            )
            
            # 5. Save Alert
            alert = Alert(
                user_id="default_user",
                title=title,
                message=message,
                alert_type="pattern_match",
                signal_id=signal.id,
                matched_activity_id=history_metadata.get('activity_id'),
                similarity_score=similarity,
                timestamp=datetime.utcnow()
            )
            
            self.db.add(alert)
            await self.db.commit()
            await self.db.refresh(alert)
            
            logger.info(f"Sentinel generated alert for {signal.symbol} (Score: {similarity:.2f})")
            return alert

        except Exception as e:
            logger.error(f"Sentinel processing failed for signal {signal.id}: {e}", exc_info=True)
            return None

    async def get_alerts(self, unread_only: bool = False, alert_type: str = None, limit: int = 50) -> List[Alert]:
        """Get recent alerts."""
        stmt = select(Alert).order_by(desc(Alert.timestamp)).limit(limit)
        
        if unread_only:
            stmt = stmt.where(Alert.is_read == False)
            
        if alert_type:
            stmt = stmt.where(Alert.alert_type == alert_type)
            
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def mark_as_read(self, alert_id: int):
        """Mark alert as read."""
        alert = await self.db.get(Alert, alert_id)
        if alert:
            alert.is_read = True
            await self.db.commit()
