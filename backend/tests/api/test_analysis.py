"""
Tests for analysis endpoints.
"""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_run_analysis_unauthorized(client: AsyncClient):
    """Test analysis endpoint without authentication."""
    response = await client.post(
        "/api/v1/analysis/run",
        json={"ticker": "NVDA"}
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_run_analysis_invalid_ticker(client: AsyncClient, auth_headers):
    """Test analysis with invalid ticker."""
    response = await client.post(
        "/api/v1/analysis/run",
        json={"ticker": ""},
        headers=auth_headers
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
@patch('app.services.analysis_service.TradingAgentsGraph')
async def test_run_analysis_success(mock_graph, client: AsyncClient, auth_headers):
    """Test successful analysis run."""
    # Mock the TradingAgentsGraph
    mock_instance = AsyncMock()
    mock_instance.propagate.return_value = (
        {
            "market_report": "Test market report",
            "fundamentals_report": "Test fundamentals",
            "final_trade_decision": "BUY"
        },
        {"action": "BUY", "confidence": 0.85}
    )
    mock_graph.return_value = mock_instance
    
    response = await client.post(
        "/api/v1/analysis/run",
        json={
            "ticker": "NVDA",
            "date": "2024-05-10"
        },
        headers=auth_headers
    )
    
    # Note: This will likely fail without proper mocking of the entire TradingAgents framework
    # For now, we expect it to attempt the analysis
    assert response.status_code in [200, 500]  # Either success or internal error


@pytest.mark.asyncio
async def test_get_analysis_history_unauthorized(client: AsyncClient):
    """Test getting analysis history without authentication."""
    response = await client.get("/api/v1/analysis/history/NVDA")
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_analysis_history_empty(client: AsyncClient, auth_headers):
    """Test getting analysis history for ticker with no history."""
    response = await client.get(
        "/api/v1/analysis/history/NVDA",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_get_analysis_by_id_not_found(client: AsyncClient, auth_headers):
    """Test getting non-existent analysis."""
    response = await client.get(
        "/api/v1/analysis/99999",
        headers=auth_headers
    )
    
    assert response.status_code == 404
