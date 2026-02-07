from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from app.core.database import get_db
from app.core.security import verify_api_key
from app.services.monitor_service import MonitorService

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic Models for Basic Request/Response
class TickerBase(BaseModel):
    symbol: str

class MonitoredTickerResponse(TickerBase):
    id: int
    is_active: bool
    last_analyzed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

@router.get("/monitor/list", response_model=List[MonitoredTickerResponse], dependencies=[Depends(verify_api_key)])
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    """Get the current watchlist."""
    service = MonitorService(db)
    return await service.get_watchlist()

@router.post("/monitor/add", response_model=MonitoredTickerResponse, dependencies=[Depends(verify_api_key)])
async def add_to_watchlist(
    ticker: TickerBase,
    db: AsyncSession = Depends(get_db)
):
    """Add a ticker to the automated monitoring list."""
    try:
        service = MonitorService(db)
        return await service.add_ticker(ticker.symbol)
    except Exception as e:
        logger.error(f"Failed to add ticker: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/monitor/remove", dependencies=[Depends(verify_api_key)])
async def remove_from_watchlist(
    ticker: TickerBase,
    db: AsyncSession = Depends(get_db)
):
    """Remove a ticker from the monitoring list."""
    try:
        service = MonitorService(db)
        await service.remove_ticker(ticker.symbol)
        return {"status": "success", "message": f"{ticker.symbol} removed"}
    except Exception as e:
        logger.error(f"Failed to remove ticker: {e}")
        raise HTTPException(status_code=500, detail=str(e))
