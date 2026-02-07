"""
Analysis API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import logging

from app.core.database import get_db
from app.core.security import verify_api_key
from app.models.trading import AnalysisRequest, AnalysisResponse
from app.services.analysis_service import AnalysisService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analysis/run", response_model=AnalysisResponse, dependencies=[Depends(verify_api_key)])
async def run_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Run full trading analysis for a ticker.
    
    This endpoint runs the TradingAgents multi-agent analysis framework:
    - Market analyst (technical analysis)
    - Fundamentals analyst (financial statements)
    - News analyst (news and insider data)
    - Social media analyst (sentiment analysis)
    - Bull vs Bear debate
    - Trader decision
    - Risk management debate
    - Final decision (BUY/HOLD/SELL)
    """
    try:
        service = AnalysisService(db)
        result = await service.run_analysis(
            ticker=request.ticker,
            date=request.date,
            analysts=request.analysts
        )
        return result
    except Exception as e:
        logger.error(f"Analysis failed for {request.ticker}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analysis/latest-batch", response_model=List[AnalysisResponse], dependencies=[Depends(verify_api_key)])
async def get_latest_analysis_batch(
    tickers: List[str],
    db: AsyncSession = Depends(get_db)
):
    """
    Get the latest analysis result for a batch of tickers.
    
    This is more efficient than calling /analysis/history for each ticker.
    """
    try:
        service = AnalysisService(db)
        results = await service.get_latest_batch(tickers)
        return results
    except Exception as e:
        logger.error(f"Failed to fetch batch analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch batch analysis: {str(e)}")


@router.get("/analysis/history/{ticker}", response_model=Dict[str, Any], dependencies=[Depends(verify_api_key)])
async def get_analysis_history(
    ticker: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get historical analysis results for a ticker."""
    try:
        service = AnalysisService(db)
        results = await service.get_history(ticker, limit)
        
        # Format response to match frontend requirements
        formatted_reports = []
        for r in results:
            # Convert dict fields to string if needed, or keep as dict if frontend can handle
            # Frontend requested string for risk_debate, but dict is better structure.
            # We'll return the Pydantic model dump which handles serialization
            report = r.model_dump()
            
            # Ensure ID is included if available (it might be in DB model but not Pydantic)
            # stored_analysis = ... (if we fetch ORM object directly)
            # For now, AnalysisResponse doesn't have ID. We might need to add it.
            # Assuming AnalysisService returns ORM objects or Pydantic models.
            # If Pydantic, it lacks ID.
            
            formatted_reports.append(report)
            
        return {
            "ticker": ticker,
            "reports": formatted_reports
        }
    except Exception as e:
        logger.error(f"Failed to fetch history for {ticker}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse, dependencies=[Depends(verify_api_key)])
async def get_analysis(
    analysis_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific analysis result by ID."""
    try:
        service = AnalysisService(db)
        result = await service.get_by_id(analysis_id)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch analysis {analysis_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis: {str(e)}")
