"""
Background task scheduler using APScheduler.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

logger = logging.getLogger(__name__)

# Create scheduler instance
scheduler = AsyncIOScheduler()


def setup_autonomous_jobs():
    """Set up autonomous trading jobs."""
    from app.config import settings
    from app.core.database import AsyncSessionLocal
    from app.services.autonomous_service import (
        gather_signals_job,
        run_analysis_job,
        monitor_positions_job
    )
    
    async def gather_signals_wrapper():
        """Wrapper to create DB session for gather_signals_job."""
        async with AsyncSessionLocal() as db:
            await gather_signals_job(db)
    
    async def run_analysis_wrapper():
        """Wrapper to create DB session for run_analysis_job."""
        async with AsyncSessionLocal() as db:
            await run_analysis_job(db)
    
    async def monitor_positions_wrapper():
        """Wrapper to create DB session for monitor_positions_job."""
        async with AsyncSessionLocal() as db:
            await monitor_positions_job(db)
    
    # Data gathering job - every 30 seconds
    scheduler.add_job(
        gather_signals_wrapper,
        trigger=IntervalTrigger(seconds=settings.data_poll_interval_seconds),
        id="gather_signals",
        name="Gather social media signals",
        replace_existing=True
    )
    
    # Analysis job - every 5 minutes
    scheduler.add_job(
        run_analysis_wrapper,
        trigger=IntervalTrigger(seconds=settings.analyst_interval_seconds),
        id="run_analysis",
        name="Run trading analysis",
        replace_existing=True
    )
    
    # Position monitoring job - every minute
    scheduler.add_job(
        monitor_positions_wrapper,
        trigger=IntervalTrigger(seconds=60),
        id="monitor_positions",
        name="Monitor positions",
        replace_existing=True
    )

    # Monitor Watchlist Analysis (The "Morning Report") - every 24 hours (or configurable)
    # For demo purposes, we'll run it every hour
    from app.services.monitor_service import MonitorService
    
    async def run_monitor_analysis_wrapper():
        """Wrapper for watchlist analysis."""
        async with AsyncSessionLocal() as db:
            service = MonitorService(db)
            await service.run_scheduled_analysis()

    scheduler.add_job(
        run_monitor_analysis_wrapper,
        trigger=IntervalTrigger(hours=1), # Run hourly for demo
        id="monitor_watchlist_analysis",
        name="Analyze Watchlist",
        replace_existing=True
    )

    # Capture Portfolio Snapshot - Hourly
    async def capture_snapshot_wrapper():
        """Wrapper for portfolio snapshot."""
        async with AsyncSessionLocal() as db:
            service = AutonomousService(db)
            await service.capture_portfolio_snapshot()
            
    scheduler.add_job(
        capture_snapshot_wrapper,
        trigger=IntervalTrigger(hours=1),
        id="capture_portfolio_snapshot",
        name="Capture Portfolio Snapshot",
        replace_existing=True
    )
    
    logger.info("Autonomous trading and Monitor jobs configured")
    
    logger.info("Autonomous trading jobs configured")


def start_scheduler():
    """Start the scheduler."""
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")


def stop_scheduler():
    """Stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
