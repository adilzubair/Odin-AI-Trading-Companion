"""
Authentication and security utilities.
"""

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import secrets

from app.config import settings

security = HTTPBearer()


def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)) -> bool:
    """Verify API key from Authorization header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(credentials.credentials, settings.api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return True


def verify_kill_switch(credentials: HTTPAuthorizationCredentials = Security(security)) -> bool:
    """Verify kill switch secret."""
    if not settings.kill_switch_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kill switch not configured"
        )
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    if not secrets.compare_digest(credentials.credentials, settings.kill_switch_secret):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid kill switch secret"
        )
    
    return True
