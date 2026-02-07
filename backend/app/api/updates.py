from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.database import Signal, Alert, Position, Trade
from app.core.security import verify_api_key

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/signals/recent")
async def get_recent_signals(
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent autonomous signals.
    """
    try:
        stmt = select(Signal).order_by(desc(Signal.timestamp)).limit(limit)
        result = await db.execute(stmt)
        signals = result.scalars().all()
        
        return {
            "signals": [
                {
                    "id": s.id,
                    "symbol": s.symbol,
                    "source": s.source,
                    "sentiment": s.sentiment,
                    "reason": s.reason,
                    "timestamp": s.timestamp.isoformat()
                }
                for s in signals
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/updates/since")
async def get_updates_since(
    timestamp: float = Query(..., description="Unix timestamp of last update"),
    db: AsyncSession = Depends(get_db)
):
    """
    Poll for updates (Alerts, Trades, Positions) since a specific timestamp.
    """
    try:
        # Convert timestamp to datetime
        since_dt = datetime.fromtimestamp(timestamp, tz=timezone.utc).replace(tzinfo=None) # DB uses naive UTC usually
        # To be safe, try both naive and aware if needed, but SQLAlchemy defaults to naive in many setups.
        # Let's assume naive UTC stored in DB.
        
        updates = []
        
        # 1. New Alerts
        stmt = select(Alert).where(Alert.timestamp > since_dt).order_by(Alert.timestamp)
        result = await db.execute(stmt)
        for a in result.scalars().all():
            updates.append({
                "type": "new_alert",
                "timestamp": a.timestamp.timestamp(),
                "data": {
                    "id": a.id,
                    "title": a.title,
                    "message": a.message,
                    "similarity": a.similarity_score
                }
            })
            
        # 2. New Trades
        stmt = select(Trade).where(Trade.created_at > since_dt).order_by(Trade.created_at)
        result = await db.execute(stmt)
        for t in result.scalars().all():
            updates.append({
                "type": "trade_executed",
                "timestamp": t.created_at.timestamp(),
                "data": {
                    "id": t.id,
                    "symbol": t.symbol,
                    "side": t.side,
                    "quantity": t.quantity,
                    "status": t.status
                }
            })
            
        # 3. Position Updates
        stmt = select(Position).where(Position.updated_at > since_dt).order_by(Position.updated_at)
        result = await db.execute(stmt)
        for p in result.scalars().all():
            updates.append({
                "type": "position_update",
                "timestamp": p.updated_at.timestamp(),
                "data": {
                    "symbol": p.symbol,
                    "status": p.status,
                    "pnl": p.pnl,
                    "quantity": p.quantity
                }
            })
            
        return {
            "updates": updates,
            "latest_timestamp": datetime.utcnow().timestamp()
        }
        
    except Exception as e:
        logger.error(f"Error fetching updates: {e}")
        raise HTTPException(status_code=500, detail=str(e))
