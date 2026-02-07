"""API router initialization."""

from app.api import health, analysis, autonomous, positions

__all__ = ["health", "analysis", "autonomous", "positions"]
