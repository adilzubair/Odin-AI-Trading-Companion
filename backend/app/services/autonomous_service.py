"""
Autonomous trading service with signal gathering and position monitoring.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import asyncio

from app.models.database import Signal, Position, TradingConfig, Trade, Log, PortfolioConfig, PortfolioSnapshot
from app.models.trading import AutonomousStatus, PositionResponse, TradeResponse, SignalResponse, PortfolioConfigResponse
from app.services.alpaca_service import AlpacaService
from app.services.analysis_service import AnalysisService
from app.services.signal_service import SignalService
from app.config import settings
from app.utils.market_hours import can_trade_symbol, is_crypto_symbol

logger = logging.getLogger(__name__)


class AutonomousService:
    """Service for autonomous trading operations."""
    
    def __init__(self, db: AsyncSession):
        """Initialize autonomous service."""
        self.db = db
        self.alpaca = AlpacaService()
        self.signal_service = SignalService(db)
        self.analysis_service = AnalysisService(db)
        self.last_data_gather = None
        self.last_analysis = None

    from app.models.database import PortfolioConfig
    
    async def get_portfolio_config(self, user_id: str = "default_user") -> PortfolioConfig:
        """Get or create portfolio config."""
        stmt = select(PortfolioConfig).where(PortfolioConfig.user_id == user_id)
        result = await self.db.execute(stmt)
        config = result.scalar_one_or_none()
        
        if not config:
            config = PortfolioConfig(user_id=user_id)
            self.db.add(config)
            await self.db.commit()
            await self.db.refresh(config)
            
        return config

    async def update_portfolio_config(self, updates: Dict[str, Any], user_id: str = "default_user") -> PortfolioConfig:
        """Update portfolio configuration."""
        config = await self.get_portfolio_config(user_id)
        
        for key, value in updates.items():
            if value is not None and hasattr(config, key):
                setattr(config, key, value)
        
        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def _check_guardrails(self, symbol: str, quantity: float, price: float) -> bool:
        """Check if trade adheres to risk/budget controls."""
        config = await self.get_portfolio_config()
        
        if not config.is_autonomous_active:
            logger.info("Guardrail: Auto-trading is paused.")
            return False
            
        trade_value = quantity * price
        
        # 1. Position Size Limit
        if trade_value > config.max_position_size:
            logger.warning(f"Guardrail: Trade value ${trade_value:.2f} exceeds max position size ${config.max_position_size:.2f}")
            return False
            
        # 2. Budget Limit (Simple check - total allocation)
        # In a real app we'd query current open positions value
        projected_allocation = config.current_allocation + trade_value
        if projected_allocation > config.total_budget:
             logger.warning(f"Guardrail: Budget exceeded. Available: ${config.total_budget - config.current_allocation:.2f}, Needed: ${trade_value:.2f}")
             return False
             
        return True
    
    async def enable(self):
        """Enable autonomous trading."""
        config = await self._get_or_create_config()
        config.enabled = True
        config.mode = "autonomous"
        await self.db.commit()
        
        await self._log("System", "autonomous_enabled", "Autonomous trading enabled")
        logger.info("Autonomous trading enabled")
    
    async def disable(self):
        """Disable autonomous trading."""
        config = await self._get_or_create_config()
        config.enabled = False
        await self.db.commit()
        
        await self._log("System", "autonomous_disabled", "Autonomous trading disabled")
        logger.info("Autonomous trading disabled")
    
    async def emergency_stop(self):
        """Emergency stop - disable and clear signals."""
        config = await self._get_or_create_config()
        config.enabled = False
        await self.db.commit()
        
        # Clear signal cache
        stmt = select(Signal).where(Signal.timestamp > datetime.now() - timedelta(hours=24))
        result = await self.db.execute(stmt)
        signals = result.scalars().all()
        for signal in signals:
            await self.db.delete(signal)
        await self.db.commit()
        
        await self._log("System", "emergency_stop", "KILL SWITCH ACTIVATED")
        logger.warning("Emergency stop activated")
    
    async def get_status(self) -> AutonomousStatus:
        """Get current autonomous trading status."""
        config = await self._get_or_create_config()
        
        # Get signal count
        stmt = select(Signal).where(Signal.timestamp > datetime.now() - timedelta(hours=24))
        result = await self.db.execute(stmt)
        signals_count = len(result.scalars().all())
        
        # Get open positions count
        stmt = select(Position).where(Position.status == "open")
        result = await self.db.execute(stmt)
        open_positions = len(result.scalars().all())
        
        # Get account info
        try:
            account = await self.alpaca.get_account()
            account_value = account.get("portfolio_value")
            cash = account.get("cash")
        except Exception as e:
            logger.error(f"Failed to get account info: {e}")
            account_value = None
            cash = None
        
        return AutonomousStatus(
            enabled=config.enabled,
            signals_count=signals_count,
            open_positions=open_positions,
            last_data_gather=self.last_data_gather,
            last_analysis=self.last_analysis,
            account_value=account_value,
            cash=cash
        )
    
    async def update_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update trading configuration."""
        config = await self._get_or_create_config()
        
        for key, value in config_data.items():
            if hasattr(config, key):
                setattr(config, key, value)
        
        await self.db.commit()
        await self._log("System", "config_updated", f"Configuration updated: {config_data}")
        
        return {
            "max_positions": config.max_positions,
            "max_position_value": config.max_position_value,
            "min_sentiment_score": config.min_sentiment_score,
            "min_analyst_confidence": config.min_analyst_confidence,
            "take_profit_pct": config.take_profit_pct,
            "stop_loss_pct": config.stop_loss_pct,
        }
    
    async def get_config(self) -> Dict[str, Any]:
        """Get current trading configuration."""
        config = await self._get_or_create_config()
        return {
            "enabled": config.enabled,
            "mode": config.mode,
            "max_positions": config.max_positions,
            "max_position_value": config.max_position_value,
            "min_sentiment_score": config.min_sentiment_score,
            "min_analyst_confidence": config.min_analyst_confidence,
            "take_profit_pct": config.take_profit_pct,
            "stop_loss_pct": config.stop_loss_pct,
        }
    
    async def get_signals(self, limit: int = 50) -> List[SignalResponse]:
        """Get recent trading signals."""
        stmt = (
            select(Signal)
            .order_by(desc(Signal.timestamp))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        signals = result.scalars().all()
        
        return [
            SignalResponse(
                symbol=s.symbol,
                source=s.source,
                sentiment=s.sentiment,
                volume=s.volume or 0,
                reason=s.reason,
                timestamp=s.timestamp
            )
            for s in signals
        ]
    
    async def get_positions(self, status: str = "open") -> List[PositionResponse]:
        """Get positions."""
        stmt = select(Position).where(Position.status == status).order_by(desc(Position.entry_time))
        result = await self.db.execute(stmt)
        positions = result.scalars().all()
        
        responses = []
        for p in positions:
            pnl_pct = None
            if p.entry_price and p.exit_price:
                pnl_pct = ((p.exit_price - p.entry_price) / p.entry_price) * 100
            
            responses.append(PositionResponse(
                symbol=p.symbol,
                quantity=p.quantity or 0,
                entry_price=p.entry_price,
                current_price=p.exit_price if status == "closed" else None,
                entry_time=p.entry_time,
                entry_reason=p.entry_reason,
                pnl=p.pnl,
                pnl_pct=pnl_pct,
                status=p.status
            ))
        
        return responses
    
    async def get_position(self, symbol: str) -> Optional[PositionResponse]:
        """Get position for a specific symbol."""
        stmt = select(Position).where(
            and_(Position.symbol == symbol, Position.status == "open")
        )
        result = await self.db.execute(stmt)
        p = result.scalar_one_or_none()
        
        if not p:
            return None
        
        return PositionResponse(
            symbol=p.symbol,
            quantity=p.quantity or 0,
            entry_price=p.entry_price,
            current_price=None,
            entry_time=p.entry_time,
            entry_reason=p.entry_reason,
            pnl=p.pnl,
            pnl_pct=None,
            status=p.status
        )
    
    async def close_position(self, symbol: str, reason: str = "Manual close") -> Dict[str, Any]:
        """Close a position."""
        # Get position from database
        stmt = select(Position).where(
            and_(Position.symbol == symbol, Position.status == "open")
        )
        result = await self.db.execute(stmt)
        position = result.scalar_one_or_none()
        
        if not position:
            raise ValueError(f"No open position found for {symbol}")
        
        # Close via Alpaca
        order = await self.alpaca.close_position(symbol)
        
        # Update database
        position.status = "closed"
        position.exit_time = datetime.now()
        position.exit_reason = reason
        
        # Get current price for P&L calculation
        alpaca_position = await self.alpaca.get_position(symbol)
        if alpaca_position:
            position.exit_price = alpaca_position["current_price"]
            if position.entry_price and position.quantity:
                position.pnl = (position.exit_price - position.entry_price) * position.quantity
        
        await self.db.commit()
        await self._log("Trading", "position_closed", f"Closed {symbol}: {reason}")
        
        return order
    
    async def get_trade_history(
        self,
        symbol: Optional[str] = None,
        limit: int = 50
    ) -> List[TradeResponse]:
        """Get trade execution history."""
        stmt = select(Trade).order_by(desc(Trade.created_at)).limit(limit)
        
        if symbol:
            stmt = stmt.where(Trade.symbol == symbol)
        
        result = await self.db.execute(stmt)
        trades = result.scalars().all()
        
        return [
            TradeResponse(
                id=t.id,
                symbol=t.symbol,
                side=t.side,
                quantity=t.quantity,
                price=t.price,
                status=t.status or "unknown",
                executed_at=t.executed_at,
                created_at=t.created_at
            )
            for t in trades
        ]
    
    async def get_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent logs."""
        stmt = select(Log).order_by(desc(Log.timestamp)).limit(limit)
        result = await self.db.execute(stmt)
        logs = result.scalars().all()
        
        return [
            {
                "timestamp": log.timestamp.isoformat(),
                "agent": log.agent,
                "action": log.action,
                "message": log.message,
                "level": log.level
            }
            for log in logs
        ]
    
    async def _get_or_create_config(self) -> TradingConfig:
        """Get or create trading configuration."""
        stmt = select(TradingConfig).where(TradingConfig.user_id == 1)
        result = await self.db.execute(stmt)
        config = result.scalar_one_or_none()
        
        if not config:
            config = TradingConfig(
                user_id=1,
                max_positions=settings.max_positions,
                max_position_value=settings.max_position_value,
                min_sentiment_score=settings.min_sentiment_score,
                min_analyst_confidence=settings.min_analyst_confidence,
                take_profit_pct=settings.take_profit_pct,
                stop_loss_pct=settings.stop_loss_pct,
                enabled=settings.autonomous_enabled
            )
            self.db.add(config)
            await self.db.commit()
            await self.db.refresh(config)
        
        return config
    
    async def _log(self, agent: str, action: str, message: str, level: str = "INFO"):
        """Log an event."""
        log = Log(
            timestamp=datetime.now(),
            agent=agent,
            action=action,
            message=message,
            level=level
        )
        self.db.add(log)
        await self.db.commit()

    async def capture_portfolio_snapshot(self, user_id: str = "default_user") -> PortfolioSnapshot:
        """Capture current portfolio value."""
        try:
            account = await self.alpaca.get_account()
            
            # Simple Logic: 
            # Total Equity = Portfolio Value
            # Cash = Cash
            # Check if values are not None
            total_equity = float(account.get("portfolio_value") or 0.0)
            cash_balance = float(account.get("cash") or 0.0)
            positions_value = total_equity - cash_balance
            
            # For pnl_daily, we can try to estimate it or use Alpaca's data
            # Alpaca account usually provides 'long_market_value', 'equity', 'last_equity'
            last_equity = float(account.get("last_equity", total_equity))
            pnl_daily = total_equity - last_equity
            
            snapshot = PortfolioSnapshot(
                user_id=user_id,
                total_equity=total_equity,
                cash_balance=cash_balance,
                positions_value=positions_value,
                pnl_daily=pnl_daily,
                pnl_all_time=0.0, # Placeholder
                timestamp=datetime.utcnow(),
                meta_data=account  # Store raw account dta just in case
            )
            
            self.db.add(snapshot)
            await self.db.commit()
            return snapshot
            
        except Exception as e:
            logger.error(f"Failed to capture portfolio snapshot: {e}")
            pass # Don't crash the loop

    async def get_portfolio_history(self, period: str = "1M", user_id: str = "default_user") -> List[PortfolioSnapshot]:
        """Get portfolio history."""
        # Calculate start date based on period
        now = datetime.utcnow()
        if period == "1W":
            start_date = now - timedelta(days=7)
        elif period == "3M":
            start_date = now - timedelta(days=90)
        elif period == "1Y":
            start_date = now - timedelta(days=365)
        else: # Default 1M
            start_date = now - timedelta(days=30)
            
        stmt = (
            select(PortfolioSnapshot)
            .where(PortfolioSnapshot.user_id == user_id)
            .where(PortfolioSnapshot.timestamp >= start_date)
            .order_by(PortfolioSnapshot.timestamp.asc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()


# Background job functions for scheduler
async def gather_signals_job(db: AsyncSession):
    """Background job to gather signals."""
    try:
        service = AutonomousService(db)
        config = await service.get_config()
        
        if not config.get("enabled"):
            return
        
        logger.info("Running signal gathering job...")
        new_signals = await service.signal_service.gather_all_signals()
        
        # Also gather signals for stocks in user history (Sentinel coverage)
        # Exclude what we just gathered to avoid duplicate work
        exclude = [s.symbol for s in new_signals]
        history_signals = await service.signal_service.gather_history_signals(exclude_symbols=exclude)
        
        # Merge for Sentinel & Logging
        all_new_signals = new_signals + history_signals
        
        service.last_data_gather = datetime.now()
        
        await service._log("System", "signals_gathered", f"Signal gathering completed ({len(all_new_signals)} new)")
        
        # Check for Sentinel Alerts
        if all_new_signals:
            from app.services.sentinel_service import SentinelService
            sentinel = SentinelService(db)
            alert_count = 0
            
            for signal in all_new_signals:
                alert = await sentinel.process_signal(signal)
                if alert:
                    alert_count += 1
            
            if alert_count > 0:
                logger.info(f"Sentinel generated {alert_count} alerts from new signals")
                await service._log("Sentinel", "alerts_generated", f"Generated {alert_count} proactive alerts")

    except Exception as e:
        logger.error(f"Signal gathering job failed: {e}", exc_info=True)


async def run_analysis_job(db: AsyncSession):
    """
    Background job to analyze top signals and execute trades.
    
    This job:
    1. Gets the top signals by sentiment and volume
    2. Runs TradingAgents analysis on promising signals
    3. Executes trades based on analysis results
    4. Respects position limits and risk parameters
    """
    try:
        service = AutonomousService(db)
        
        # Check if autonomous mode is enabled
        config = await service.get_config()
        if not config.get("enabled"):
            logger.debug("Autonomous mode disabled, skipping analysis job")
            return
        
        logger.info("Running analysis job...")
        
        # Get current positions count
        result = await db.execute(
            select(func.count(Position.id)).where(Position.status == "open")
        )
        open_positions = result.scalar() or 0
        
        max_positions = config.get("max_positions", 5)
        if open_positions >= max_positions:
            logger.info(f"Max positions ({max_positions}) reached, skipping analysis")
            await service._log_event("AnalysisJob", "max_positions_reached", 
                                     f"Already have {open_positions} open positions")
            return
        
        # Get top signals from last 2 hours
        min_sentiment = config.get("min_sentiment_score", 0.3)
        two_hours_ago = datetime.now() - timedelta(hours=2)
        
        result = await db.execute(
            select(Signal)
            .where(Signal.timestamp >= two_hours_ago)
            .where(Signal.sentiment >= min_sentiment)
            .order_by(Signal.sentiment.desc(), Signal.volume.desc())
            .limit(5)
        )
        top_signals = result.scalars().all()
        
        if not top_signals:
            logger.info("No signals above minimum sentiment threshold")
            return
        
        logger.info(f"Analyzing {len(top_signals)} top signals")
        
        # Analyze each signal
        from app.services.analysis_service import AnalysisService
        from app.services.alpaca_service import AlpacaService
        
        analysis_service = AnalysisService(db)
        alpaca_service = AlpacaService()
        
        for signal in top_signals:
            if open_positions >= max_positions:
                break
            
            try:
                # Check if we can trade this symbol
                can_trade, reason = can_trade_symbol(signal.symbol, settings.ignore_market_hours)
                if not can_trade:
                    logger.info(f"Skipping {signal.symbol}: {reason}")
                    continue
                
                logger.info(f"Analyzing {signal.symbol} (sentiment: {signal.sentiment:.2f})")
                
                # Run analysis
                analysis = await analysis_service.run_analysis(
                    ticker=signal.symbol,
                    analysts=["market", "fundamentals"]  # Quick analysis
                )
                
                # Check config
                pf_config = await service.get_portfolio_config()
                if not pf_config.is_autonomous_active:
                     logger.info("Auto-pilot paused. Skipping trade.")
                     continue
                
                # Check if we should trade
                min_confidence = config.get("min_analyst_confidence", 0.6)
                if analysis.final_decision == "BUY" and (analysis.confidence or 0) >= min_confidence:
                    # Calculate position size
                    account = alpaca_service.get_account()
                    
                    # Use PortfolioConfig for sizing
                    max_position_value = pf_config.max_position_size
                    
                    # Get current price
                    quote = alpaca_service.get_quote(signal.symbol)
                    current_price = quote.get("ask_price") or quote.get("last_price")
                    
                    if not current_price:
                        logger.warning(f"Could not get price for {signal.symbol}")
                        continue
                    
                    # Calculate quantity
                    quantity = int(max_position_value / current_price)
                    
                    if quantity < 1:
                        logger.warning(f"Position size too small for {signal.symbol}")
                        continue
                        
                    # CHECK GUARDRAILS
                    is_safe = await service._check_guardrails(signal.symbol, quantity, current_price)
                    if not is_safe:
                        logger.warning(f"Guardrail Check Failed for {signal.symbol}. Trade aborted.")
                        continue
                    
                    # Execute buy order
                    logger.info(f"Executing BUY order: {quantity} shares of {signal.symbol} @ ${current_price:.2f}")
                    
                    order = alpaca_service.place_order(
                        symbol=signal.symbol,
                        qty=quantity,
                        side="buy",
                        order_type="market"
                    )
                    
                    if order:
                        # Create position record
                        position = Position(
                            symbol=signal.symbol,
                            entry_time=datetime.now(),
                            entry_price=current_price,
                            entry_sentiment=signal.sentiment,
                            entry_social_volume=signal.volume,
                            entry_reason=f"Analysis: {analysis.final_decision}, Confidence: {analysis.confidence:.2%}, Signal: {signal.reason}",
                            quantity=quantity,
                            status="open",
                            meta_data={
                                "analysis_id": analysis.id if hasattr(analysis, 'id') else None,
                                "signal_source": signal.source,
                                "order_id": order.get("id")
                            }
                        )
                        db.add(position)
                        
                        # Create trade record
                        trade = Trade(
                            position_id=None,  # Will update after position is saved
                            symbol=signal.symbol,
                            side="buy",
                            quantity=quantity,
                            price=current_price,
                            order_type="market",
                            status=order.get("status"),
                            alpaca_order_id=order.get("id"),
                            executed_at=datetime.now(),
                            meta_data={"analysis_confidence": analysis.confidence}
                        )
                        db.add(trade)
                        
                        await db.commit()
                        await db.refresh(position)
                        
                        # Update trade with position_id
                        trade.position_id = position.id
                        await db.commit()
                        
                        open_positions += 1
                        
                        await service._log_event(
                            "AnalysisJob", 
                            "trade_executed",
                            f"Bought {quantity} shares of {signal.symbol} @ ${current_price:.2f}",
                            "INFO"
                        )
                        
                        logger.info(f"✅ Position opened: {signal.symbol}")
                    else:
                        logger.error(f"Failed to execute order for {signal.symbol}")
                        
                else:
                    logger.info(f"Skipping {signal.symbol}: decision={analysis.final_decision}, confidence={analysis.confidence}")
                    
            except Exception as e:
                logger.error(f"Error analyzing {signal.symbol}: {e}", exc_info=True)
                await service._log("AnalysisJob", "analysis_error", 
                                        f"Error analyzing {signal.symbol}: {str(e)}", "ERROR")
                continue
        
        logger.info("Analysis job completed")
        
    except Exception as e:
        logger.error(f"Analysis job failed: {e}", exc_info=True)


async def monitor_positions_job(db: AsyncSession):
    """
    Background job to monitor open positions and execute take-profit/stop-loss.
    
    This job:
    1. Gets all open positions
    2. Checks current prices
    3. Calculates P&L
    4. Executes take-profit or stop-loss if thresholds are met
    """
    try:
        service = AutonomousService(db)
        
        # Check if autonomous mode is enabled
        config = await service.get_config()
        if not config.get("enabled"):
            logger.debug("Autonomous mode disabled, skipping position monitoring")
            return
        
        logger.info("Monitoring positions...")
        
        # Get all open positions
        result = await db.execute(
            select(Position).where(Position.status == "open")
        )
        open_positions = result.scalars().all()
        
        if not open_positions:
            logger.debug("No open positions to monitor")
            return
        
        logger.info(f"Monitoring {len(open_positions)} open positions")
        
        from app.services.alpaca_service import AlpacaService
        alpaca_service = AlpacaService()
        
        take_profit_pct = config.get("take_profit_pct", 10.0)
        stop_loss_pct = config.get("stop_loss_pct", 5.0)
        
        for position in open_positions:
            try:
                # Get current price
                quote = alpaca_service.get_quote(position.symbol)
                current_price = quote.get("bid_price") or quote.get("last_price")
                
                if not current_price:
                    logger.warning(f"Could not get price for {position.symbol}")
                    continue
                
                # Calculate P&L
                entry_price = position.entry_price or 0
                pnl_pct = ((current_price - entry_price) / entry_price * 100) if entry_price > 0 else 0
                pnl_dollars = (current_price - entry_price) * position.quantity
                
                logger.info(f"{position.symbol}: Entry=${entry_price:.2f}, Current=${current_price:.2f}, P&L={pnl_pct:+.2f}% (${pnl_dollars:+.2f})")
                
                should_close = False
                close_reason = ""
                
                # Check take-profit
                if pnl_pct >= take_profit_pct:
                    should_close = True
                    close_reason = f"Take-profit triggered at {pnl_pct:+.2f}% (target: {take_profit_pct}%)"
                    logger.info(f"🎯 {close_reason}")
                
                # Check stop-loss
                elif pnl_pct <= -stop_loss_pct:
                    should_close = True
                    close_reason = f"Stop-loss triggered at {pnl_pct:+.2f}% (limit: -{stop_loss_pct}%)"
                    logger.info(f"🛑 {close_reason}")
                
                if should_close:
                    # Execute sell order
                    logger.info(f"Closing position: {position.quantity} shares of {position.symbol} @ ${current_price:.2f}")
                    
                    order = alpaca_service.place_order(
                        symbol=position.symbol,
                        qty=position.quantity,
                        side="sell",
                        order_type="market"
                    )
                    
                    if order:
                        # Update position
                        position.exit_time = datetime.now()
                        position.exit_price = current_price
                        position.exit_reason = close_reason
                        position.status = "closed"
                        position.pnl = pnl_dollars
                        
                        # Create trade record
                        trade = Trade(
                            position_id=position.id,
                            symbol=position.symbol,
                            side="sell",
                            quantity=position.quantity,
                            price=current_price,
                            order_type="market",
                            status=order.get("status"),
                            alpaca_order_id=order.get("id"),
                            executed_at=datetime.now(),
                            meta_data={
                                "pnl_pct": pnl_pct,
                                "pnl_dollars": pnl_dollars,
                                "reason": close_reason
                            }
                        )
                        db.add(trade)
                        
                        await db.commit()
                        
                        await service._log(
                            "PositionMonitor",
                            "position_closed",
                            f"Closed {position.symbol}: {close_reason}, P&L: ${pnl_dollars:+.2f}",
                            "INFO"
                        )
                        
                        logger.info(f"✅ Position closed: {position.symbol}, P&L: ${pnl_dollars:+.2f}")
                    else:
                        logger.error(f"Failed to close position for {position.symbol}")
                        
            except Exception as e:
                logger.error(f"Error monitoring position {position.symbol}: {e}", exc_info=True)
                await service._log("PositionMonitor", "monitor_error",
                                        f"Error monitoring {position.symbol}: {str(e)}", "ERROR")
                continue
        
        logger.info("Position monitoring completed")
        
    except Exception as e:
        logger.error(f"Position monitoring job failed: {e}", exc_info=True)

