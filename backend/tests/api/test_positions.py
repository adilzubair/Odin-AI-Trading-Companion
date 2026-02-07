"""
Tests for position management endpoints.
"""

import pytest
from httpx import AsyncClient
from datetime import datetime

from app.models.database import Position


@pytest.mark.asyncio
async def test_list_positions_unauthorized(client: AsyncClient):
    """Test listing positions without authentication."""
    response = await client.get("/api/v1/positions")
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_positions_empty(client: AsyncClient, auth_headers):
    """Test listing positions when none exist."""
    response = await client.get(
        "/api/v1/positions",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_list_positions_with_data(client: AsyncClient, auth_headers, test_db):
    """Test listing positions with existing data."""
    # Create a test position
    position = Position(
        symbol="NVDA",
        entry_time=datetime.now(),
        entry_price=450.0,
        quantity=10,
        status="open",
        entry_reason="Test position"
    )
    test_db.add(position)
    await test_db.commit()
    
    response = await client.get(
        "/api/v1/positions",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["symbol"] == "NVDA"
    assert data[0]["status"] == "open"


@pytest.mark.asyncio
async def test_get_position_not_found(client: AsyncClient, auth_headers):
    """Test getting non-existent position."""
    response = await client.get(
        "/api/v1/positions/AAPL",
        headers=auth_headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_position(client: AsyncClient, auth_headers, test_db):
    """Test getting specific position."""
    # Create a test position
    position = Position(
        symbol="TSLA",
        entry_time=datetime.now(),
        entry_price=250.0,
        quantity=5,
        status="open",
        entry_reason="Test position"
    )
    test_db.add(position)
    await test_db.commit()
    
    response = await client.get(
        "/api/v1/positions/TSLA",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "TSLA"
    assert data["quantity"] == 5


@pytest.mark.asyncio
async def test_get_trade_history_empty(client: AsyncClient, auth_headers):
    """Test getting trade history when empty."""
    response = await client.get(
        "/api/v1/trades/history",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_get_trade_history_with_symbol_filter(client: AsyncClient, auth_headers):
    """Test getting trade history with symbol filter."""
    response = await client.get(
        "/api/v1/trades/history?symbol=NVDA",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
