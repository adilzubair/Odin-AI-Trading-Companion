# 🔧 Backend API Requirements for Frontend Integration

**Project:** PsyTrade Multi-Agent Trader  
**Document Version:** 1.0  
**Date:** February 6, 2026  
**Prepared For:** Backend Development Team  
**Prepared By:** Frontend Development Team

---

## 📋 Executive Summary

This document outlines the backend API endpoints and configurations required to integrate the PsyTrade frontend application. The frontend is built with Next.js and requires real-time market data, trading execution, and AI analysis capabilities.

**Current Status:**
- ✅ Core trading endpoints exist (trades, positions, autonomous)
- ✅ Observer and Sentinel systems documented
- ❌ Market data endpoints missing (CRITICAL)
- ❌ Real-time updates mechanism missing
- ❌ Some response formats unspecified

**Priority Level:**
- 🔴 **CRITICAL** - Must have before frontend integration
- 🟡 **HIGH** - Should have for MVP launch
- 🟢 **MEDIUM** - Nice to have for enhanced UX

---

## 🔴 CRITICAL Requirements (Blocking Frontend Development)

### 1. Market Data Endpoints

**Problem:** Frontend cannot display stock prices, charts, or real-time updates without market data.

#### 1.1 Real-time Quote
```http
GET /api/v1/market/quote/{symbol}
```

**Path Parameters:**
- `symbol` (string, required) - Stock ticker symbol (e.g., "AAPL", "BTC")

**Response:** `200 OK`
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 178.50,
  "change": 2.30,
  "change_percentage": 1.31,
  "volume": 52000000,
  "market_cap": 2800000000000,
  "timestamp": "2023-10-27T15:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Symbol not found
- `503 Service Unavailable` - Market data provider unavailable

**Use Cases:**
- Display current price in stock list
- Show real-time price in trading panel
- Update position current prices

---

#### 1.2 Historical Price Data
```http
GET /api/v1/market/history/{symbol}
```

**Path Parameters:**
- `symbol` (string, required) - Stock ticker symbol

**Query Parameters:**
- `timeframe` (string, required) - One of: `1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `3Y`, `5Y`, `All`
- `interval` (string, optional) - One of: `1m`, `5m`, `15m`, `1h`, `1d`, `1w` (defaults based on timeframe)

**Response:** `200 OK`
```json
{
  "symbol": "AAPL",
  "timeframe": "1D",
  "interval": "5m",
  "data": [
    {
      "timestamp": 1698408000,
      "open": 176.20,
      "high": 178.80,
      "low": 175.90,
      "close": 178.50,
      "volume": 1200000
    }
  ]
}
```

**Default Intervals by Timeframe:**
- `1D` → `5m` (78 data points)
- `1W` → `30m` (35 data points)
- `1M` → `1d` (30 data points)
- `3M` → `1d` (90 data points)
- `6M` → `1d` (180 data points)
- `1Y` → `1d` (252 data points)
- `3Y` → `1w` (156 data points)
- `5Y` → `1w` (260 data points)
- `All` → `1w` (520 data points)

**Use Cases:**
- Render interactive stock charts
- Display mini sparkline charts in stock list
- Show historical performance

---

#### 1.3 Batch Quotes (Optional but Recommended)
```http
POST /api/v1/market/quotes
```

**Request Body:**
```json
{
  "symbols": ["AAPL", "NVDA", "MSFT", "GOOGL", "TSLA"]
}
```

**Response:** `200 OK`
```json
{
  "quotes": [
    {
      "symbol": "AAPL",
      "price": 178.50,
      "change": 2.30,
      "change_percentage": 1.31
    }
  ],
  "timestamp": "2023-10-27T15:30:00Z"
}
```

**Use Cases:**
- Efficiently fetch multiple stock prices for stock list
- Reduce API calls (1 request instead of 10)

**Implementation Note:**
- Can use Alpaca Market Data API as data source
- Consider caching quotes for 1-5 seconds to reduce external API calls
- Rate limiting recommended (e.g., 100 requests/minute per user)

---

### 2. CORS Configuration

**Problem:** Browser will block all API requests without proper CORS headers.

**Required Configuration:**
```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js dev server
        "http://localhost:3001",      # Alternative port
        "https://yourdomain.com"      # Production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count"]  # If using pagination
)
```

**Testing:**
```bash
# Should return CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-API-Key" \
     -X OPTIONS \
     http://localhost:8000/api/v1/trades/execute
```

---

### 3. Trade History Response Format

**Problem:** `GET /trades/history` endpoint exists but response format is not documented.

**Required Specification:**
```http
GET /api/v1/trades/history
```

**Query Parameters:**
- `limit` (integer, optional) - Number of trades to return (default: 100, max: 500)
- `status` (string, optional) - Filter by status: `all`, `filled`, `pending`, `cancelled` (default: `all`)
- `symbol` (string, optional) - Filter by symbol
- `since` (timestamp, optional) - Only trades after this timestamp

**Response:** `200 OK`
```json
{
  "trades": [
    {
      "id": "trade_abc123",
      "symbol": "AAPL",
      "side": "buy",
      "quantity": 10,
      "price": 175.00,
      "total": 1750.00,
      "status": "filled",
      "reason": "Breakout pattern detected",
      "created_at": "2023-10-27T14:30:00Z",
      "filled_at": "2023-10-27T14:30:05Z",
      "source": "manual"  // or "autonomous"
    }
  ],
  "total_count": 245,
  "page": 1
}
```

**Status Values:**
- `pending` - Order submitted but not filled
- `filled` - Order completed
- `cancelled` - Order cancelled
- `rejected` - Order rejected by broker

---

### 4. Error Response Standardization

**Problem:** Consistent error format needed for frontend error handling.

**Standard Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "timestamp": "2023-10-27T15:30:00Z"
  }
}
```

**Standard Error Codes:**

| HTTP Status | Error Code | Message | Use Case |
|------------|------------|---------|----------|
| 400 | `INVALID_SYMBOL` | "Stock symbol '{symbol}' not found" | Invalid ticker |
| 400 | `INVALID_QUANTITY` | "Quantity must be a positive integer" | Bad trade quantity |
| 400 | `INSUFFICIENT_FUNDS` | "Not enough cash to execute trade" | Insufficient balance |
| 400 | `GUARDRAIL_VIOLATION` | "Trade exceeds maximum position size" | Risk limit exceeded |
| 401 | `INVALID_API_KEY` | "API key is invalid or expired" | Bad authentication |
| 403 | `MARKET_CLOSED` | "Market is currently closed" | Trading hours |
| 404 | `POSITION_NOT_FOUND` | "Position for '{symbol}' not found" | Position doesn't exist |
| 429 | `RATE_LIMIT_EXCEEDED` | "Too many requests, try again later" | Rate limiting |
| 503 | `SERVICE_UNAVAILABLE` | "Trading service temporarily unavailable" | Broker API down |

**Example Error Response:**
```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough cash to execute trade",
    "details": {
      "required": 5000.00,
      "available": 3000.00,
      "symbol": "AAPL",
      "quantity": 10
    },
    "timestamp": "2023-10-27T15:30:00Z"
  }
}
```

---

## 🟡 HIGH Priority Requirements (Needed for MVP)

### 5. Portfolio History Endpoint

**Problem:** Frontend displays portfolio performance charts but has no data source.

```http
GET /api/v1/portfolio/history
```

**Query Parameters:**
- `timeframe` (string, optional) - One of: `1D`, `1W`, `1M`, `3M`, `6M`, `1Y` (default: `1M`)
- `interval` (string, optional) - One of: `1h`, `1d` (default based on timeframe)

**Response:** `200 OK`
```json
{
  "timeframe": "1M",
  "interval": "1d",
  "data": [
    {
      "timestamp": 1698408000,
      "total_value": 105000.00,
      "cash": 50000.00,
      "positions_value": 55000.00,
      "pnl": 5000.00,
      "pnl_percentage": 5.0,
      "day_pnl": 250.00,
      "day_pnl_percentage": 0.24
    }
  ]
}
```

**Implementation Note:**
- Store daily snapshots of portfolio value
- Can be calculated from trade history and position values
- Recommend storing snapshots at market close each day

---

### 6. Signals Endpoint

**Problem:** Frontend displays "signals" from agents but no API endpoint exists.

**Decision Required:** Should signals be exposed to frontend or remain internal?

**If YES, add this endpoint:**
```http
GET /api/v1/signals/recent
```

**Query Parameters:**
- `limit` (integer, optional) - Number of signals to return (default: 50, max: 100)
- `status` (string, optional) - Filter by status: `active`, `executed`, `expired` (default: `active`)

**Response:** `200 OK`
```json
{
  "signals": [
    {
      "id": "sig_abc123",
      "source": "mahoraga",
      "category": "technical",
      "symbol": "AAPL",
      "action": "buy",
      "confidence": 0.85,
      "reason": "RSI oversold + bullish divergence detected",
      "timestamp": "2023-10-27T14:30:00Z",
      "status": "active",
      "expires_at": "2023-10-27T16:00:00Z"
    }
  ]
}
```

**If NO, please confirm:**
- Frontend will remove "Active Signals" section from Auto Trade tab
- Signals remain internal to autonomous trading system only

---

### 7. Real-time Updates Mechanism

**Problem:** Frontend needs real-time updates for positions, alerts, and trades.

**Recommended Approach (Phase 1 - Polling):**

```http
GET /api/v1/updates/since
```

**Query Parameters:**
- `timestamp` (integer, required) - Unix timestamp of last update

**Response:** `200 OK`
```json
{
  "updates": [
    {
      "type": "position_update",
      "timestamp": 1698408100,
      "data": {
        "symbol": "AAPL",
        "current_price": 178.50,
        "pnl": 250.00
      }
    },
    {
      "type": "new_alert",
      "timestamp": 1698408150,
      "data": {
        "id": 15,
        "title": "Warning: High VIX",
        "message": "VIX is up 5%. Historically, you lose money 80% of the time when VIX > 25."
      }
    },
    {
      "type": "trade_executed",
      "timestamp": 1698408200,
      "data": {
        "id": "trade_xyz789",
        "symbol": "NVDA",
        "side": "buy",
        "status": "filled"
      }
    }
  ],
  "latest_timestamp": 1698408200
}
```

**Update Types:**
- `position_update` - Position price changed
- `new_alert` - New Sentinel alert
- `trade_executed` - Trade completed
- `signal_generated` - New signal (if signals are exposed)
- `analysis_completed` - Analysis finished

**Frontend Polling Strategy:**
- Poll every 5 seconds when user is active
- Poll every 30 seconds when user is idle
- Stop polling when tab is not visible

**Future Enhancement (Phase 2 - WebSocket):**
```
WS /ws/updates?api_key=dev_secret_key
```
- More efficient than polling
- Instant updates
- Lower server load
- Can be added after MVP

---

### 8. Analysis Trigger Endpoint (If Supported)

**Problem:** Frontend has "START ANALYSIS" button but unclear if on-demand analysis is supported.

**Decision Required:** Can users trigger instant analysis, or is it only scheduled (nightly)?

**If YES, add these endpoints:**

#### 8.1 Trigger Analysis
```http
POST /api/v1/analysis/trigger
```

**Request Body:**
```json
{
  "symbols": ["AAPL", "NVDA"]
}
```

**Response:** `202 Accepted`
```json
{
  "status": "queued",
  "job_id": "job_abc123",
  "estimated_completion": "2023-10-27T15:35:00Z",
  "symbols": ["AAPL", "NVDA"]
}
```

#### 8.2 Check Analysis Status
```http
GET /api/v1/analysis/status/{job_id}
```

**Response:** `200 OK`
```json
{
  "job_id": "job_abc123",
  "status": "processing",  // or "completed", "failed"
  "progress": 0.65,
  "symbols_completed": ["AAPL"],
  "symbols_pending": ["NVDA"],
  "results": null  // or array of AnalysisResponse when completed
}
```

**If NO:**
- Frontend will remove "START ANALYSIS" button
- Display message: "Analysis runs automatically every night at 8 AM"
- Show last analysis timestamp

---

## 🟢 MEDIUM Priority Requirements (Nice to Have)

### 9. User Preferences Endpoint

**Purpose:** Save user settings for better UX.

```http
GET /api/v1/user/preferences
POST /api/v1/user/preferences
```

**Response/Request Body:**
```json
{
  "default_timeframe": "1D",
  "favorite_symbols": ["AAPL", "NVDA", "BTC"],
  "alert_notifications": true,
  "theme": "dark",
  "chart_type": "candlestick"
}
```

---

### 10. Analytics Endpoints

**Purpose:** Provide trading performance insights.

#### 10.1 Performance Metrics
```http
GET /api/v1/analytics/performance
```

**Query Parameters:**
- `period` (string, optional) - One of: `1W`, `1M`, `3M`, `1Y`, `All` (default: `1M`)

**Response:** `200 OK`
```json
{
  "period": "1M",
  "win_rate": 0.65,
  "total_trades": 45,
  "profitable_trades": 29,
  "losing_trades": 16,
  "average_gain": 2.5,
  "average_loss": -1.8,
  "largest_win": 15.2,
  "largest_loss": -8.5,
  "sharpe_ratio": 1.45,
  "max_drawdown": -8.5
}
```

#### 10.2 Agent Performance
```http
GET /api/v1/analytics/agents
```

**Response:** `200 OK`
```json
{
  "agents": [
    {
      "name": "Technical Analyst",
      "accuracy": 0.72,
      "total_predictions": 150,
      "correct_predictions": 108,
      "average_confidence": 0.78
    },
    {
      "name": "Sentiment Analyst",
      "accuracy": 0.68,
      "total_predictions": 150,
      "correct_predictions": 102,
      "average_confidence": 0.65
    }
  ]
}
```

---

## 🔧 Implementation Recommendations

### Market Data Source

**Recommended:** Use Alpaca Market Data API as backend proxy

**Advantages:**
- Already integrated for trading
- Free tier available
- Real-time and historical data
- No additional API keys needed

**Implementation Pattern:**
```python
# Backend proxies Alpaca API
@app.get("/api/v1/market/quote/{symbol}")
async def get_quote(symbol: str):
    # Fetch from Alpaca
    alpaca_data = await alpaca_client.get_latest_quote(symbol)
    
    # Transform to our format
    return {
        "symbol": symbol,
        "price": alpaca_data.ask_price,
        "change": calculate_change(alpaca_data),
        # ...
    }
```

**Benefits:**
- Hides Alpaca API key from frontend
- Can add caching layer
- Can switch data providers without frontend changes

---

### Caching Strategy

**Recommended:** Add Redis caching for frequently accessed data

**Cache Durations:**
- Stock quotes: 1-5 seconds (real-time data)
- Historical data: 1 hour (doesn't change)
- Portfolio history: 5 minutes
- Analysis reports: Until next analysis run
- User preferences: Until updated

**Example:**
```python
@cache(ttl=5)  # Cache for 5 seconds
async def get_quote(symbol: str):
    return await fetch_from_alpaca(symbol)
```

---

### Rate Limiting

**Recommended Limits:**
- Market data: 100 requests/minute per user
- Trade execution: 10 requests/minute per user
- Analysis trigger: 5 requests/hour per user
- General endpoints: 200 requests/minute per user

**Headers to Include:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698408000
```

---

## 📝 Testing Checklist

Before frontend integration, please verify:

- [ ] All CRITICAL endpoints implemented and tested
- [ ] CORS configured for `localhost:3000`
- [ ] Error responses follow standard format
- [ ] API documentation updated with all new endpoints
- [ ] Rate limiting configured
- [ ] Market data endpoints return valid data
- [ ] Trade execution works end-to-end
- [ ] Autonomous system status reflects real state
- [ ] Sentinel alerts are being generated
- [ ] Observer is logging user actions

---

## 🚀 Rollout Plan

### Phase 1: Core Integration (Week 1)
- ✅ Implement market data endpoints
- ✅ Configure CORS
- ✅ Standardize error responses
- ✅ Document trade history format
- ✅ Test with frontend team

### Phase 2: Real-time Features (Week 2)
- ✅ Add portfolio history endpoint
- ✅ Implement polling updates endpoint
- ✅ Add signals endpoint (if exposing)
- ✅ Test real-time updates

### Phase 3: Enhancements (Week 3)
- ✅ Add analytics endpoints
- ✅ Implement user preferences
- ✅ Add WebSocket support
- ✅ Performance optimization

---

## 📞 Contact & Questions

**Frontend Team Lead:** [Your Name]  
**Questions/Clarifications:** Please reach out for any unclear requirements

**Key Decisions Needed:**
1. Should signals be exposed to frontend? (Yes/No)
2. Is on-demand analysis supported? (Yes/No)
3. Which market data provider to use? (Alpaca/Other)
4. WebSocket timeline? (Phase 2/Phase 3)

---

## 📎 Appendix

### A. Example API Call Flow

**User Executes a Trade:**
```
1. Frontend: POST /api/v1/trades/execute
   Body: { symbol: "AAPL", quantity: 10, side: "buy", reason: "Breakout" }

2. Backend: Validates trade, checks guardrails
3. Backend: Calls Alpaca API to execute
4. Backend: Logs to Observer (automatic)
5. Backend: Returns trade confirmation

6. Frontend: Displays success message
7. Frontend: Polls /api/v1/updates/since for trade status
8. Backend: Returns trade_executed update
9. Frontend: Updates positions list
```

### B. Current API Coverage

| Feature | Endpoint Exists | Response Documented | Notes |
|---------|----------------|---------------------|-------|
| Monitor (Watchlist) | ✅ | ✅ | Complete |
| Autonomous Status | ✅ | ✅ | Complete |
| Autonomous Config | ✅ | ✅ | Complete |
| Trade Execution | ✅ | ⚠️ | Need response format |
| Positions | ✅ | ✅ | Complete |
| Sentinel Alerts | ✅ | ✅ | Complete |
| Observer Logging | ✅ | ✅ | Complete |
| Market Data | ❌ | ❌ | **CRITICAL - Missing** |
| Portfolio History | ❌ | ❌ | **HIGH - Missing** |
| Signals | ❌ | ❌ | Decision needed |
| Real-time Updates | ❌ | ❌ | HIGH - Missing |

---

**End of Document**
