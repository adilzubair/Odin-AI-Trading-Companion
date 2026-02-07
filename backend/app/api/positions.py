"""
Position management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from app.core.database import get_db
from app.core.security import verify_api_key
from app.models.trading import PositionResponse, TradeResponse, ManualTradeRequest
from app.services.autonomous_service import AutonomousService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/positions", response_model=List[PositionResponse], dependencies=[Depends(verify_api_key)])
async def list_positions(
    status: str = "open",
    db: AsyncSession = Depends(get_db)
):
    """List all positions (open or closed)."""
    try:
        service = AutonomousService(db)
        positions = await service.get_positions(status=status)
        return positions
    except Exception as e:
        logger.error(f"Failed to list positions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list positions: {str(e)}")


@router.get("/positions/{symbol}", response_model=PositionResponse, dependencies=[Depends(verify_api_key)])
async def get_position(
    symbol: str,
    db: AsyncSession = Depends(get_db)
):
    """Get position details for a specific symbol."""
    try:
        service = AutonomousService(db)
        position = await service.get_position(symbol)
        if not position:
            raise HTTPException(status_code=404, detail=f"Position not found for {symbol}")
        return position
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get position for {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get position: {str(e)}")


@router.post("/positions/{symbol}/close", dependencies=[Depends(verify_api_key)])
async def close_position(
    symbol: str,
    db: AsyncSession = Depends(get_db)
):
    """Manually close a position."""
    try:
        service = AutonomousService(db)
        result = await service.close_position(symbol, reason="Manual close via API")
        return {"status": "closed", "symbol": symbol, "result": result}
    except Exception as e:
        logger.error(f"Failed to close position {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to close position: {str(e)}")


@router.get("/trades/history", response_model=List[TradeResponse], dependencies=[Depends(verify_api_key)])
async def get_trade_history(
    symbol: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get trade execution history."""
    try:
        service = AutonomousService(db)
        trades = await service.get_trade_history(symbol=symbol, limit=limit)
        return trades
    except Exception as e:
        logger.error(f"Failed to get trade history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get trade history: {str(e)}")
@router.post("/trades/execute", dependencies=[Depends(verify_api_key)])
async def execute_trade(
    trade_request: ManualTradeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute a manual trade (Buy/Sell) and log it to the Observer.
    """
    try:
        # 1. Execute via Alpaca
        from app.services.alpaca_service import AlpacaService
        alpaca = AlpacaService()
        
        result = await alpaca.place_market_order(
            symbol=trade_request.symbol,
            quantity=trade_request.quantity,
            side=trade_request.side
        )
        
        # 2. Log metadata for the trade
        actual_price = None
        # Try to get estimated price if filled immediately isn't available
        if not actual_price:
             quote = await alpaca.get_latest_quote(trade_request.symbol)
             actual_price = quote.get("ask_price") if trade_request.side == "buy" else quote.get("bid_price")
             
        # 3. Log to Observer (PsychTrade)
        from app.services.observer_service import ObserverService
        from app.models.trading import UserActionCreate
        
        observer = ObserverService(db)
        await observer.log_action(UserActionCreate(
            activity_type="manual_trade_executed",
            symbol=trade_request.symbol,
            side=trade_request.side,
            quantity=trade_request.quantity,
            client_context=trade_request.reason or "Manual Execution via API",
            meta_data={"alpaca_order_id": result.get("order_id"), "estimated_price": actual_price}
        ))
        
        return {
            "status": "submitted",
            "order": result,
            "message": f"Order submitted and logged to Observer."
        }
        
    except Exception as e:
        logger.error(f"Failed to execute trade: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to execute trade: {str(e)}")
