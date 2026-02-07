from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from app.core.database import get_db
from app.core.security import verify_api_key
from app.models.trading import UserActionCreate, UserActionResponse
from app.services.observer_service import ObserverService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/observer/log", response_model=UserActionResponse, dependencies=[Depends(verify_api_key)])
async def log_user_action(
    action: UserActionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Log a manual user action (e.g., trade attempt, chart view).
    The Observer will automatically enrich this with current market context.
    """
    try:
        service = ObserverService(db)
        activity = await service.log_action(action)
        
        return UserActionResponse(
            id=activity.id,
            user_id=activity.user_id,
            symbol=activity.symbol,
            activity_type=activity.activity_type,
            sentiment_at_time=activity.sentiment_score,
            news_context=activity.news_context,
            timestamp=activity.timestamp
        )
    except Exception as e:
        logger.error(f"Failed to log user action: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/observer/history", response_model=List[UserActionResponse], dependencies=[Depends(verify_api_key)])
async def get_user_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the user's past actions with their recorded context.
    """
    try:
        service = ObserverService(db)
        history = await service.get_history(user_id="default_user", limit=limit)
        
        return [
            UserActionResponse(
                id=h.id,
                user_id=h.user_id,
                symbol=h.symbol,
                activity_type=h.activity_type,
                sentiment_at_time=h.sentiment_score,
                news_context=h.news_context,
                timestamp=h.timestamp
            )
            for h in history
        ]
    except Exception as e:
        logger.error(f"Failed to fetch user history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
