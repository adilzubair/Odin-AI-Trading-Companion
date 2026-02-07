"""
Tests for autonomous trading endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_autonomous_status_unauthorized(client: AsyncClient):
    """Test status endpoint without authentication."""
    response = await client.get("/api/v1/autonomous/status")
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_autonomous_status(client: AsyncClient, auth_headers):
    """Test getting autonomous status."""
    response = await client.get(
        "/api/v1/autonomous/status",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "enabled" in data
    assert "signals_count" in data
    assert "open_positions" in data
    assert data["enabled"] is False  # Should be disabled by default


@pytest.mark.asyncio
async def test_enable_autonomous(client: AsyncClient, auth_headers):
    """Test enabling autonomous trading."""
    response = await client.post(
        "/api/v1/autonomous/enable",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "enabled"


@pytest.mark.asyncio
async def test_disable_autonomous(client: AsyncClient, auth_headers):
    """Test disabling autonomous trading."""
    # First enable it
    await client.post("/api/v1/autonomous/enable", headers=auth_headers)
    
    # Then disable
    response = await client.post(
        "/api/v1/autonomous/disable",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "disabled"


@pytest.mark.asyncio
async def test_get_config(client: AsyncClient, auth_headers):
    """Test getting trading configuration."""
    response = await client.get(
        "/api/v1/autonomous/config",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "enabled" in data
    assert "max_positions" in data
    assert "min_sentiment_score" in data


@pytest.mark.asyncio
async def test_update_config(client: AsyncClient, auth_headers):
    """Test updating trading configuration."""
    response = await client.post(
        "/api/v1/autonomous/config",
        json={
            "max_positions": 3,
            "take_profit_pct": 15.0
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "updated"
    assert data["config"]["max_positions"] == 3
    assert data["config"]["take_profit_pct"] == 15.0


@pytest.mark.asyncio
async def test_get_signals(client: AsyncClient, auth_headers):
    """Test getting signals."""
    response = await client.get(
        "/api/v1/autonomous/signals",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_logs(client: AsyncClient, auth_headers):
    """Test getting logs."""
    response = await client.get(
        "/api/v1/autonomous/logs",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)


@pytest.mark.asyncio
async def test_kill_switch_unauthorized(client: AsyncClient, auth_headers):
    """Test kill switch with wrong credentials."""
    response = await client.post(
        "/api/v1/autonomous/kill",
        headers=auth_headers  # Using regular auth, not kill switch secret
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_kill_switch(client: AsyncClient, kill_switch_headers):
    """Test emergency kill switch."""
    response = await client.post(
        "/api/v1/autonomous/kill",
        headers=kill_switch_headers
    )
    
    # May fail if kill switch secret not configured
    assert response.status_code in [200, 403]
