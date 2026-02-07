"""
Autonomous trading API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import logging

from app.core.database import get_db
from app.core.security import verify_api_key, verify_kill_switch
from app.models.trading import AutonomousStatus, TradingConfigUpdate, SignalResponse, PortfolioConfigUpdate, PortfolioConfigResponse
from app.services.autonomous_service import AutonomousService
from app.core.scheduler import scheduler, setup_autonomous_jobs
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/autonomous/enable", dependencies=[Depends(verify_api_key)])
async def enable_autonomous(db: AsyncSession = Depends(get_db)):
    """Enable autonomous trading mode."""
    try:
        service = AutonomousService(db)
        await service.enable()
        
        # Start scheduler if not running
        if not scheduler.running:
            setup_autonomous_jobs()
            scheduler.start()
            logger.info("Autonomous trading enabled and scheduler started")
        
        return {"status": "enabled", "message": "Autonomous trading enabled"}
    except Exception as e:
        logger.error(f"Failed to enable autonomous trading: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to enable: {str(e)}")


@router.post("/autonomous/disable", dependencies=[Depends(verify_api_key)])
async def disable_autonomous(db: AsyncSession = Depends(get_db)):
    """Disable autonomous trading mode."""
    try:
        service = AutonomousService(db)
        await service.disable()
        
        logger.info("Autonomous trading disabled")
        return {"status": "disabled", "message": "Autonomous trading disabled"}
    except Exception as e:
        logger.error(f"Failed to disable autonomous trading: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to disable: {str(e)}")


@router.get("/autonomous/status", response_model=AutonomousStatus, dependencies=[Depends(verify_api_key)])
async def get_status(db: AsyncSession = Depends(get_db)):
    """Get autonomous trading status."""
    try:
        service = AutonomousService(db)
        status = await service.get_status()
        return status
    except Exception as e:
        logger.error(f"Failed to get status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


@router.post("/autonomous/config", response_model=PortfolioConfigResponse, dependencies=[Depends(verify_api_key)])
async def update_config(
    config: PortfolioConfigUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update Auto-Pilot Configuration (Budget, Risk, Status).
    """
    try:
        service = AutonomousService(db)
        # Use simple update_portfolio_config with dict dump
        updated = await service.update_portfolio_config(config.model_dump(exclude_none=True))
        return updated
    except Exception as e:
        logger.error(f"Failed to update config: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update config: {str(e)}")


@router.get("/autonomous/config", response_model=PortfolioConfigResponse, dependencies=[Depends(verify_api_key)])
async def get_config(db: AsyncSession = Depends(get_db)):
    """
    Get current Auto-Pilot configuration.
    """
    try:
        service = AutonomousService(db)
        config = await service.get_portfolio_config()
        return config
    except Exception as e:
        logger.error(f"Failed to get config: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get config: {str(e)}")


@router.get("/autonomous/signals", response_model=List[SignalResponse], dependencies=[Depends(verify_api_key)])
async def get_signals(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get recent trading signals."""
    try:
        service = AutonomousService(db)
        signals = await service.get_signals(limit)
        return signals
    except Exception as e:
        logger.error(f"Failed to get signals: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get signals: {str(e)}")


@router.get("/autonomous/logs", dependencies=[Depends(verify_api_key)])
async def get_logs(
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get recent trading logs."""
    try:
        service = AutonomousService(db)
        logs = await service.get_logs(limit)
        return {"logs": logs}
    except Exception as e:
        logger.error(f"Failed to get logs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get logs: {str(e)}")


@router.post("/autonomous/kill", dependencies=[Depends(verify_kill_switch)])
async def kill_switch(db: AsyncSession = Depends(get_db)):
    """
    Emergency kill switch - immediately disable autonomous trading.
    
    Requires separate KILL_SWITCH_SECRET for authorization.
    """
    try:
        service = AutonomousService(db)
        await service.emergency_stop()
        
        # Stop scheduler
        if scheduler.running:
            scheduler.shutdown(wait=False)
        
        logger.warning("KILL SWITCH ACTIVATED - Autonomous trading stopped")
        return {
            "status": "killed",
            "message": "Emergency kill switch activated. Autonomous trading disabled.",
            "note": "Existing positions are NOT automatically closed. Review and close manually if needed."
        }
    except Exception as e:
        logger.error(f"Kill switch failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Kill switch failed: {str(e)}")
