from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.autonomous_service import AutonomousService
from app.core.security import verify_api_key

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/portfolio/history")
async def get_portfolio_history(
    timeframe: str = Query("1M", description="Timeframe: 1W, 1M, 3M, 1Y"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get portfolio performance history for charts.
    """
    try:
        service = AutonomousService(db)
        # Assuming user_id=1 or "default_user" for MVP
        history = await service.get_portfolio_history(period=timeframe)
        
        # Format for frontend
        data = [
            {
                "timestamp": h.timestamp.isoformat(),
                "total_value": h.total_equity,
                "cash": h.cash_balance,
                "positions_value": h.positions_value,
                "pnl": h.pnl_all_time,
                "day_pnl": h.pnl_daily
            }
            for h in history
        ]
        
        return {
            "timeframe": timeframe,
            "interval": "1d", # Default for now
            "data": data
        }
    except Exception as e:
        logger.error(f"Error fetching portfolio history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/positions")
async def get_positions(
    status: str = "open",
    db: AsyncSession = Depends(get_db)
):
    """
    Get current positions from Alpaca (Source of Truth).
    """
    try:
        # Use AlpacaService directly for real-time positions
        # Or use AutonomousService.alpaca
        service = AutonomousService(db)
        
        # If status is open, we can fetch from Alpaca
        if status == "open":
            positions = await service.alpaca.get_positions()
            
            # Compute totals
            total_market_value = sum(p["market_value"] for p in positions)
            total_unrealized_pnl = sum(p["unrealized_pl"] for p in positions)
            
            formatted_positions = [
                {
                    "symbol": p["symbol"],
                    "quantity": p["quantity"],
                    "entry_price": p["avg_entry_price"],
                    "current_price": p["current_price"],
                    "unrealized_pnl": p["unrealized_pl"],
                    "unrealized_pnl_percent": p["unrealized_plpc"] * 100, # Alpaca returns decimal (e.g. 0.05), frontend might want % or decimal? Frontend said 1.45 (percent)
                    "market_value": p["market_value"],
                    "side": "long" if p["quantity"] > 0 else "short",
                    "opened_at": datetime.utcnow().isoformat() # Alpaca doesn't give opened_at easily without querying orders
                }
                for p in positions
            ]
            
            return {
                "positions": formatted_positions,
                "total_positions": len(formatted_positions),
                "total_market_value": total_market_value,
                "total_unrealized_pnl": total_unrealized_pnl
            }
        else:
            # If closed, we might need DB history, but for now stick to open
            return {"positions": [], "total_positions": 0, "total_market_value": 0, "total_unrealized_pnl": 0}

    except Exception as e:
        logger.error(f"Error fetching positions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trades/history")
async def get_trade_history(
    limit: int = 100,
    offset: int = 0,
    symbol: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get trade history from internal database.
    """
    try:
        service = AutonomousService(db)
        stmt = select(Trade).order_by(desc(Trade.created_at)).limit(limit).offset(offset)
        
        if symbol:
            stmt = stmt.where(Trade.symbol == symbol)
            
        result = await db.execute(stmt)
        trades = result.scalars().all()
        
        # Get total count (separate query usually, but simple for now)
        # count_stmt = select(func.count()).select_from(Trade)
        # total_count = (await db.execute(count_stmt)).scalar() or 0
        total_count = len(trades) # Approximation for limit
        
        formatted_trades = [
            {
                "id": str(t.id),
                "symbol": t.symbol,
                "side": t.side,
                "quantity": t.quantity,
                "price": t.price,
                "total_value": (t.price or 0) * t.quantity,
                "status": t.status,
                "reason": "Autonomous Trade", # Or extract from metadata
                "source": "autonomous",
                "created_at": t.created_at.isoformat(),
                "filled_at": t.executed_at.isoformat() if t.executed_at else None
            }
            for t in trades
        ]
        
        return {
            "trades": formatted_trades,
            "total_count": total_count,
            "page": (offset // limit) + 1,
            "page_size": limit
        }
        
    except Exception as e:
        logger.error(f"Error fetching trade history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
