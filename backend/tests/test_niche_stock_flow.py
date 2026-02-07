
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.services.observer_service import ObserverService
from app.services.signal_service import SignalService
from app.models.trading import UserActionCreate
from app.models.database import UserActivity, Signal

@pytest.mark.asyncio
async def test_niche_stock_active_fetch(test_db):
    """
    Test scenario:
    1. User buys 'IREN' (niche stock, not in cache).
    2. Observer should trigger 'Active Fetch'.
    3. Active Fetch returns rich news ("Contract Signed").
    4. Observer should save this rich news in UserActivity.
    """
    
    # 1. Setup Services
    with patch("app.services.observer_service.UserHistoryMemory") as MockMemory:
        # Configure the mock to return a mock instance
        mock_memory_instance = MockMemory.return_value
        
        observer = ObserverService(test_db)
        
        # Ensure our mock signals are used (Observer inits SignalService internally)
        # We need to mock the method on the instance that Observer created
        # OR we can mock SignalService class before Observer init. 
        # But we already mock fetch_signals_for_ticker on the instance below.
        
        # Verify observer has memory mocked
        assert observer.memory == mock_memory_instance
    
    # Mock the signal service's active fetch to simulate finding specific news
    # We want to verify that the system captures the "Reason" text
    rich_signal = Signal(
        symbol="IREN",
        source="stocktwits",
        source_detail="active_fetch",
        sentiment=0.8,
        reason="Active Fetch: IREN signs 200MW deal with AWS (Sentiment: 80%)",
        timestamp=datetime.now(),
        meta_data={"top_content": "IREN signs 200MW deal with AWS"}
    )
    
    # Mock the internal signal service of the observer
    observer.signal_service.fetch_signals_for_ticker = AsyncMock(return_value=[rich_signal])
    
    # 2. Simulate User Action (Buying IREN)
    action = UserActionCreate(
        activity_type="trade_attempt",
        symbol="IREN",
        side="buy",
        quantity=100,
        client_context="Buying on news breakout"
    )
    
    # 3. Execute Log Action
    # This is the core function we are testing
    print("\n[Test] Logging action for IREN...")
    activity = await observer.log_action(action=action, user_id="test_user")
    
    # 4. Verify Database Storage
    print(f"[Test] Activity logged. ID: {activity.id}")
    print(f"[Test] Stored News Context: {activity.news_context}")
    print(f"[Test] Stored Sentiment: {activity.sentiment_score}")
    
    # Assertions
    assert activity.symbol == "IREN"
    assert activity.sentiment_score == 0.8
    # CRITICAL CHECK: Did we capture the "Why"?
    assert "IREN signs 200MW deal with AWS" in activity.news_context
    
    # Verify active fetch was actually called
    observer.signal_service.fetch_signals_for_ticker.assert_called_once_with("IREN")
    print("\n[PASS] System successfully active-fetched news and stored the specific context.")
