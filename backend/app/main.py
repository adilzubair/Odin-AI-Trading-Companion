"""
FastAPI application entry point.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.core.database import init_db, close_db
from app.core.scheduler import scheduler
from app.api import analysis, autonomous, positions, health, observer, sentinel, monitor, market, portfolio, updates

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting Unified Trading Bot...")
    await init_db()
    
    # Start scheduler if autonomous mode is enabled
    if settings.autonomous_enabled:
        logger.info("Starting autonomous trading scheduler...")
        
        # 1. Existing Signal/Trading Job
        # ... exists in autonomous.py but typically logic is added here or in autonomous_service
        # (Assuming it's managed there for now)
        
        # 2. Add Monitor Job (Daily Analysis)
        # We need a function wrapper to call the async service
        from app.services.monitor_service import MonitorService
        from app.core.database import AsyncSessionLocal
        
        async def run_daily_monitor():
             async with AsyncSessionLocal() as db:
                 service = MonitorService(db)
                 await service.run_scheduled_analysis()
                 
        # Run every morning at 8:00 AM (or strictly periodically for demo)
        scheduler.add_job(run_daily_monitor, 'cron', hour=8, minute=0, id='daily_monitor_report')
        
        scheduler.start()
    
    yield
    
    # Shutdown
    logger.info("Shutting down Unified Trading Bot...")
    if scheduler.running:
        scheduler.shutdown()
    await close_db()


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Unified trading bot with multi-agent analysis and autonomous trading",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.api_prefix, tags=["Health"])
app.include_router(analysis.router, prefix=settings.api_prefix, tags=["Analysis"])
app.include_router(autonomous.router, prefix=settings.api_prefix, tags=["Autonomous Trading"])
app.include_router(positions.router, prefix=settings.api_prefix, tags=["Positions"])
app.include_router(observer.router, prefix=settings.api_prefix, tags=["Observer"])
app.include_router(sentinel.router, prefix=settings.api_prefix, tags=["Sentinel"])
app.include_router(monitor.router, prefix=settings.api_prefix, tags=["Monitor"])
app.include_router(market.router, prefix=settings.api_prefix, tags=["Market"])
app.include_router(portfolio.router, prefix=settings.api_prefix, tags=["Portfolio"])
app.include_router(updates.router, prefix=settings.api_prefix, tags=["Real-Time Updates"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An error occurred"
        }
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "autonomous_enabled": settings.autonomous_enabled,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
