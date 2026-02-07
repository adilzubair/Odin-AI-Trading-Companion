"""
Analysis service integrating TradingAgents framework.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional
from datetime import datetime, date
import logging
import os
import sys

from app.models.database import AnalysisResult
from app.models.trading import AnalysisResponse
from app.config import settings

# Add agents directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'agents'))

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.dataflows.config import set_config

logger = logging.getLogger(__name__)


class AnalysisService:
    """Service for running trading analysis using TradingAgents."""
    
    def __init__(self, db: AsyncSession):
        """Initialize analysis service."""
        self.db = db
        self._trading_graph = None
    
    def _get_trading_graph(self, analysts: List[str]) -> TradingAgentsGraph:
        """Get or create TradingAgentsGraph instance."""
        # Set environment variables for LLM API keys (required by TradingAgents)
        if settings.openai_api_key:
            os.environ['OPENAI_API_KEY'] = settings.openai_api_key
        if settings.anthropic_api_key:
            os.environ['ANTHROPIC_API_KEY'] = settings.anthropic_api_key
        if settings.google_api_key:
            os.environ['GOOGLE_API_KEY'] = settings.google_api_key
        if settings.alpha_vantage_api_key:
            os.environ['ALPHA_VANTAGE_API_KEY'] = settings.alpha_vantage_api_key
        
        # Get configuration for TradingAgents
        config = settings.get_tradingagents_config()
        
        # Set data flow config
        set_config(config)
        
        # Create TradingAgentsGraph
        graph = TradingAgentsGraph(
            selected_analysts=analysts,
            debug=settings.debug,
            config=config
        )
        
        return graph
    
    async def run_analysis(
        self,
        ticker: str,
        date: Optional[str] = None,
        analysts: List[str] = None,
        save_db: bool = True
    ) -> AnalysisResponse:
        """
        Run full trading analysis for a ticker.
        
        Args:
            ticker: Stock ticker symbol
            date: Analysis date (YYYY-MM-DD), defaults to today
            analysts: List of analysts to include
            save_db: Whether to save results to database (Default: True)
        
        Returns:
            AnalysisResponse with all analysis results
        """
        if analysts is None:
            analysts = ["market", "fundamentals", "news", "social"]
        
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        logger.info(f"Running analysis for {ticker} on {date} with analysts: {analysts}")
        
        try:
            # Get TradingAgentsGraph
            graph = self._get_trading_graph(analysts)
            
            # Run analysis
            final_state, decision = graph.propagate(ticker, date)
            
            # Convert state to JSON-serializable format
            serializable_state = self._make_json_serializable(final_state)
            
            # Extract decision (decision is a string: "BUY", "SELL", or "HOLD")
            final_decision = decision.strip() if isinstance(decision, str) else None
            
            # Set default confidence for valid decisions
            confidence = 0.7 if final_decision in ["BUY", "SELL"] else None
            
            # Extract results
            analysis_data = {
                "ticker": ticker,
                "trade_date": date,
                "market_report": serializable_state.get("market_report"),
                "sentiment_report": serializable_state.get("sentiment_report"),
                "news_report": serializable_state.get("news_report"),
                "fundamentals_report": serializable_state.get("fundamentals_report"),
                "investment_debate": serializable_state.get("investment_debate_state"),
                "trader_decision": serializable_state.get("trader_investment_plan"),
                "risk_debate": serializable_state.get("risk_debate_state"),
                "final_decision": final_decision,
                "confidence": confidence,
                "full_state": serializable_state,
            }
            
            # Save to database if requested
            if save_db:
                db_result = AnalysisResult(**analysis_data)
                self.db.add(db_result)
                await self.db.commit()
                await self.db.refresh(db_result)
                created_at_val = db_result.created_at
                logger.info(f"Analysis completed and saved for {ticker}")
            else:
                created_at_val = datetime.utcnow()
                logger.info(f"Analysis completed for {ticker} (not saved)")
            
            # Return response
            return AnalysisResponse(
                ticker=analysis_data["ticker"],
                trade_date=analysis_data["trade_date"],
                market_report=analysis_data["market_report"],
                sentiment_report=analysis_data["sentiment_report"],
                news_report=analysis_data["news_report"],
                fundamentals_report=analysis_data["fundamentals_report"],
                investment_debate=analysis_data["investment_debate"],
                trader_decision=analysis_data["trader_decision"],
                risk_debate=analysis_data["risk_debate"],
                final_decision=analysis_data["final_decision"],
                confidence=analysis_data["confidence"],
                created_at=created_at_val
            )
            
        except Exception as e:
            logger.error(f"Analysis failed for {ticker}: {e}", exc_info=True)
            raise
    
    def _make_json_serializable(self, obj):
        """Convert object to JSON-serializable format."""
        if isinstance(obj, dict):
            return {k: self._make_json_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._make_json_serializable(item) for item in obj]
        elif hasattr(obj, 'dict'):  # Pydantic models
            return obj.dict()
        elif hasattr(obj, 'content'):  # LangChain messages
            return {
                "type": obj.__class__.__name__,
                "content": str(obj.content)
            }
        elif isinstance(obj, (str, int, float, bool, type(None))):
            return obj
        else:
            # For any other type, convert to string
            return str(obj)
    
    async def get_history(
        self,
        ticker: str,
        limit: int = 10
    ) -> List[AnalysisResponse]:
        """Get historical analysis results for a ticker."""
        try:
            stmt = (
                select(AnalysisResult)
                .where(AnalysisResult.ticker == ticker)
                .order_by(desc(AnalysisResult.created_at))
                .limit(limit)
            )
            result = await self.db.execute(stmt)
            results = result.scalars().all()
            
            return [
                AnalysisResponse(
                    ticker=r.ticker,
                    trade_date=r.trade_date,
                    market_report=r.market_report,
                    sentiment_report=r.sentiment_report,
                    news_report=r.news_report,
                    fundamentals_report=r.fundamentals_report,
                    investment_debate=r.investment_debate,
                    trader_decision=r.trader_decision,
                    risk_debate=r.risk_debate,
                    final_decision=r.final_decision,
                    confidence=r.confidence,
                    created_at=r.created_at
                )
                for r in results
            ]
        except Exception as e:
            logger.error(f"Failed to get history for {ticker}: {e}", exc_info=True)
            raise
    
    async def get_by_id(self, analysis_id: int) -> Optional[AnalysisResponse]:
        """Get a specific analysis result by ID."""
        try:
            stmt = select(AnalysisResult).where(AnalysisResult.id == analysis_id)
            result = await self.db.execute(stmt)
            r = result.scalar_one_or_none()
            
            if not r:
                return None
            
            return AnalysisResponse(
                ticker=r.ticker,
                trade_date=r.trade_date,
                market_report=r.market_report,
                sentiment_report=r.sentiment_report,
                news_report=r.news_report,
                fundamentals_report=r.fundamentals_report,
                investment_debate=r.investment_debate,
                trader_decision=r.trader_decision,
                risk_debate=r.risk_debate,
                final_decision=r.final_decision,
                confidence=r.confidence,
                created_at=r.created_at
            )
        except Exception as e:
            logger.error(f"Failed to get analysis {analysis_id}: {e}", exc_info=True)
            raise

    async def get_latest_batch(self, tickers: List[str]) -> List[AnalysisResponse]:
        """Get the latest analysis result for each ticker in the list."""
        if not tickers:
            return []
            
        try:
            # Subquery to find the latest created_at for each ticker
            subq = (
                select(
                    AnalysisResult.ticker,
                    func.max(AnalysisResult.created_at).label("max_created_at")
                )
                .where(AnalysisResult.ticker.in_(tickers))
                .group_by(AnalysisResult.ticker)
                .subquery()
            )
            
            # Join with the main table to get full records
            stmt = (
                select(AnalysisResult)
                .join(
                    subq,
                    (AnalysisResult.ticker == subq.c.ticker) & 
                    (AnalysisResult.created_at == subq.c.max_created_at)
                )
            )
            
            result = await self.db.execute(stmt)
            results = result.scalars().all()
            
            return [
                AnalysisResponse(
                    ticker=r.ticker,
                    trade_date=r.trade_date,
                    market_report=r.market_report,
                    sentiment_report=r.sentiment_report,
                    news_report=r.news_report,
                    fundamentals_report=r.fundamentals_report,
                    investment_debate=r.investment_debate,
                    trader_decision=r.trader_decision,
                    risk_debate=r.risk_debate,
                    final_decision=r.final_decision,
                    confidence=r.confidence,
                    created_at=r.created_at
                )
                for r in results
            ]
        except Exception as e:
            logger.error(f"Failed to get batch analysis: {e}", exc_info=True)
            raise
