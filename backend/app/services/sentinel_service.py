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
            activity_id = history_metadata.get('activity_id')
            
            # Fetch the matched activity details
            activity = None
            if activity_id:
                activity = await self.db.get(UserActivity, activity_id)
            
            # 4. Generate Enhanced Alert Content
            news_event = signal.reason or "Market event"
            
            # Build past action description
            if activity:
                action_desc = f"{activity.side or 'traded'} {activity.quantity or 0:.0f} shares"
                if activity.price_at_action:
                    action_desc += f" at ${activity.price_at_action:.2f}"
            else:
                action_desc = "traded"
            
            # Get outcome text
            outcome_text = ""
            if activity and activity.outcome:
                outcome_text = f"• Result: {activity.outcome}"
            else:
                outcome_text = "• Result: Outcome not yet recorded"
            
            # Determine alert type based on outcome
            alert_type = "pattern_match"
            advice = "Consider reviewing this pattern before trading."
            
            if activity and activity.outcome:
                outcome_lower = activity.outcome.lower()
                if "profit" in outcome_lower or ("+" in activity.outcome and "$" in activity.outcome):
                    alert_type = "opportunity"
                    advice = "This pattern previously led to a profit. Similar opportunity detected."
                elif "loss" in outcome_lower or ("-" in activity.outcome and "$" in activity.outcome):
                    alert_type = "risk_warning"
                    advice = "⚠️ Warning: This pattern previously led to a loss. Review carefully before trading."
            
            # Build rich message
            title = f"Proactive Alert: {signal.symbol}"
            message = (
                f"📰 News Event: \"{news_event}\"\n\n"
                f"⚠️ Similar Situation Detected ({similarity:.0%} match)\n\n"
                f"Last time during similar news:\n"
                f"• You {action_desc}\n"
                f"{outcome_text}\n\n"
                f"💡 {advice}"
            )
            
            # Store additional context in meta_data
            meta_data = {
                "signal_reason": signal.reason,
                "signal_source": signal.source,
                "past_side": activity.side if activity else None,
                "past_quantity": float(activity.quantity) if activity and activity.quantity else None,
                "past_price": float(activity.price_at_action) if activity and activity.price_at_action else None,
                "past_outcome": activity.outcome if activity else None,
                "news_context": activity.news_context if activity else None
            }
            
            # 5. Save Alert
            alert = Alert(
                user_id="default_user",
                title=title,
                message=message,
                alert_type=alert_type,
                signal_id=signal.id,
                matched_activity_id=activity_id,
                similarity_score=similarity,
                timestamp=datetime.utcnow(),
                meta_data=meta_data
            )
            
            self.db.add(alert)
            await self.db.commit()
            await self.db.refresh(alert)
            
            logger.info(f"Sentinel generated alert for {signal.symbol} (Score: {similarity:.2f}, Type: {alert_type})")
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
