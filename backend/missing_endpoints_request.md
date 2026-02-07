# 🚨 Missing API Endpoints Request

**From:** Frontend Development Team  
**To:** Backend Development Team  
**Date:** February 7, 2026  
**Subject:** Critical Missing Endpoints for Frontend Integration  
**Priority:** 🔴 HIGH

---

## 📋 Executive Summary

Thank you for the updated API documentation! We've reviewed the implementation and **70% of the endpoints are ready**. However, we've identified **5 missing endpoints** that are blocking full frontend integration.

This document explains:
- **What's missing** and why we need it
- **Use cases** for each endpoint
- **Proposed response formats** (based on our original requirements)
- **Priority levels** and impact

---

## 🔴 CRITICAL Priority (Blocking Core Features)

### 1. Analysis History Endpoint

#### **Endpoint:**
```http
GET /api/v1/analysis/history/{ticker}
```

#### **Why We Need This:**
The **Analysis tab** is a core feature that displays AI-generated analysis reports for watchlist tickers. Currently, we have:
- ✅ Watchlist management (`/monitor/add`, `/monitor/remove`, `/monitor/list`)
- ❌ **No way to fetch the actual analysis reports!**

Without this endpoint, the Analysis tab shows an empty state even though tickers are in the watchlist.

#### **Use Cases:**
1. **Display Analysis Reports**: When user clicks on a ticker in the watchlist, show the latest analysis
2. **Show Confidence Levels**: Display the AI's confidence score for each recommendation
3. **Historical Analysis**: Show previous analysis reports to track how recommendations changed over time
4. **Decision Context**: Show the market report and risk debate that led to the BUY/SELL/HOLD decision

#### **User Flow:**
```
1. User adds "AAPL" to watchlist → POST /monitor/add ✅
2. Backend runs nightly analysis → (Internal process) ✅
3. User opens Analysis tab → GET /monitor/list ✅
4. User clicks "AAPL" → GET /analysis/history/AAPL ❌ MISSING!
5. Display analysis report with decision, confidence, reasoning
```

#### **Proposed Request:**
```http
GET /api/v1/analysis/history/{ticker}
```

**Path Parameters:**
- `ticker` (string, required) - Stock symbol (e.g., "AAPL")

**Query Parameters:**
- `limit` (integer, optional) - Number of reports to return (default: 10, max: 50)

#### **Proposed Response:** `200 OK`
```json
{
  "ticker": "AAPL",
  "reports": [
    {
      "id": 123,
      "ticker": "AAPL",
      "final_decision": "BUY",
      "confidence": 0.78,
      "market_report": "Apple continues to show strong fundamentals with robust iPhone sales and growing services revenue. The recent product launches have been well-received, and the company maintains a healthy balance sheet with significant cash reserves. Technical indicators suggest bullish momentum with price trading above key moving averages.",
      "risk_debate": "Primary risks include potential regulatory challenges in the EU and China, supply chain dependencies, and market saturation in smartphone segment. However, the diversification into services and wearables provides revenue stability. Current valuation appears reasonable given growth prospects and market position.",
      "created_at": "2026-02-07T08:00:00Z",
      "analyzed_at": "2026-02-07T08:00:00Z"
    },
    {
      "id": 122,
      "ticker": "AAPL",
      "final_decision": "HOLD",
      "confidence": 0.65,
      "market_report": "Previous analysis from yesterday...",
      "risk_debate": "Previous risk assessment...",
      "created_at": "2026-02-06T08:00:00Z",
      "analyzed_at": "2026-02-06T08:00:00Z"
    }
  ]
}
```

#### **Field Descriptions:**
- `final_decision` - One of: `"BUY"`, `"SELL"`, `"HOLD"`
- `confidence` - Float between 0.0 and 1.0 (e.g., 0.78 = 78% confidence)
- `market_report` - Detailed analysis of market conditions and fundamentals
- `risk_debate` - Risk assessment and counterarguments
- `created_at` - When the analysis was generated
- `analyzed_at` - When the analysis was run (same as created_at for nightly runs)

#### **Error Responses:**
- `404 Not Found` - Ticker not found or no analysis available
  ```json
  {
    "error": {
      "code": "NO_ANALYSIS_FOUND",
      "message": "No analysis reports found for ticker 'AAPL'"
    }
  }
  ```

#### **Impact if Not Implemented:**
- ❌ Analysis tab is completely non-functional
- ❌ Users cannot see AI recommendations
- ❌ Core value proposition of the app is lost
- ❌ **This is a BLOCKER for MVP launch**

---

### 2. Positions Endpoint

#### **Endpoint:**
```http
GET /api/v1/positions
```

#### **Why We Need This:**
When the user opens the app, we need to display their **current open positions** immediately. Currently, we can only get position updates through `/updates/since`, but that requires:
1. Knowing what positions exist already
2. Polling continuously to build state from events

We need a **snapshot endpoint** to get the current state on page load.

#### **Use Cases:**
1. **Initial Page Load**: Show all open positions when user opens the app
2. **Position List**: Display in the "Auto Trade" tab
3. **Portfolio Value**: Calculate total portfolio value
4. **P&L Display**: Show unrealized profit/loss for each position

#### **User Flow:**
```
1. User opens app
2. Frontend calls GET /positions
3. Display positions in "Auto Trade" tab
4. Poll /updates/since for real-time updates
```

#### **Proposed Request:**
```http
GET /api/v1/positions
```

**Query Parameters:**
- `status` (string, optional) - Filter by status: `open`, `closed`, `all` (default: `open`)

#### **Proposed Response:** `200 OK`
```json
{
  "positions": [
    {
      "symbol": "AAPL",
      "quantity": 10,
      "entry_price": 185.50,
      "current_price": 188.20,
      "unrealized_pnl": 27.00,
      "unrealized_pnl_percent": 1.45,
      "market_value": 1882.00,
      "side": "long",
      "opened_at": "2026-02-05T14:30:00Z"
    },
    {
      "symbol": "NVDA",
      "quantity": 5,
      "entry_price": 722.30,
      "current_price": 735.80,
      "unrealized_pnl": 67.50,
      "unrealized_pnl_percent": 1.87,
      "market_value": 3679.00,
      "side": "long",
      "opened_at": "2026-02-04T10:15:00Z"
    }
  ],
  "total_positions": 2,
  "total_market_value": 5561.00,
  "total_unrealized_pnl": 94.50
}
```

#### **Field Descriptions:**
- `entry_price` - Average entry price for the position
- `current_price` - Current market price
- `unrealized_pnl` - Unrealized profit/loss in dollars
- `unrealized_pnl_percent` - Unrealized P&L as percentage
- `market_value` - Current value of position (quantity × current_price)
- `side` - Position direction: `"long"` or `"short"`
- `opened_at` - When the position was first opened

#### **Alternative (Simpler) Response:**
If the above is too complex, a minimal version would be:
```json
[
  {
    "symbol": "AAPL",
    "quantity": 10,
    "entry_price": 185.50,
    "current_price": 188.20,
    "pnl": 27.00,
    "pnl_pct": 1.45
  }
]
```

#### **Impact if Not Implemented:**
- ⚠️ Positions list is empty on page load
- ⚠️ User must wait for `/updates/since` to populate positions
- ⚠️ Poor user experience (blank screen initially)
- ⚠️ Cannot calculate total portfolio value accurately

**Workaround**: We can use `/updates/since` and build state from events, but it's not ideal.

---

## 🟡 HIGH Priority (Needed for Complete UX)

### 3. Trade History Endpoint

#### **Endpoint:**
```http
GET /api/v1/trades/history
```

#### **Why We Need This:**
Users want to see their **trading history** - all past trades, both filled and pending. This is essential for:
- Reviewing past decisions
- Tracking performance
- Auditing trades
- Tax reporting

Currently, we can only see trades as they happen via `/updates/since`, but we can't see historical trades.

#### **Use Cases:**
1. **Trade History Tab**: Display all past trades
2. **Performance Analysis**: Calculate win rate, average gain/loss
3. **Trade Journal**: Review reasoning for past trades
4. **Filtering**: Filter by symbol, date range, status

#### **User Flow:**
```
1. User clicks "Trade History" tab
2. Frontend calls GET /trades/history
3. Display table of all trades
4. User filters by symbol or date
```

#### **Proposed Request:**
```http
GET /api/v1/trades/history
```

**Query Parameters:**
- `limit` (integer, optional) - Number of trades to return (default: 100, max: 500)
- `offset` (integer, optional) - Pagination offset (default: 0)
- `status` (string, optional) - Filter by status: `all`, `filled`, `pending`, `cancelled` (default: `all`)
- `symbol` (string, optional) - Filter by ticker symbol
- `since` (timestamp, optional) - Only trades after this timestamp
- `until` (timestamp, optional) - Only trades before this timestamp

#### **Proposed Response:** `200 OK`
```json
{
  "trades": [
    {
      "id": "trade_abc123",
      "symbol": "AAPL",
      "side": "buy",
      "quantity": 10,
      "price": 185.50,
      "total_value": 1855.00,
      "status": "filled",
      "reason": "Breakout pattern detected",
      "source": "manual",
      "created_at": "2026-02-05T14:30:00Z",
      "filled_at": "2026-02-05T14:30:05Z"
    },
    {
      "id": "trade_def456",
      "symbol": "NVDA",
      "side": "buy",
      "quantity": 5,
      "price": 722.30,
      "total_value": 3611.50,
      "status": "filled",
      "reason": "AI buy signal - high confidence",
      "source": "autonomous",
      "created_at": "2026-02-04T10:15:00Z",
      "filled_at": "2026-02-04T10:15:03Z"
    }
  ],
  "total_count": 245,
  "page": 1,
  "page_size": 100
}
```

#### **Field Descriptions:**
- `status` - One of: `"pending"`, `"filled"`, `"cancelled"`, `"rejected"`
- `source` - One of: `"manual"` (user-initiated), `"autonomous"` (bot-initiated)
- `reason` - Why the trade was executed
- `created_at` - When the order was submitted
- `filled_at` - When the order was filled (null if pending/cancelled)

#### **Impact if Not Implemented:**
- ⚠️ No trade history display
- ⚠️ Cannot review past decisions
- ⚠️ Limited performance analytics

**Workaround**: Store `trade_executed` events from `/updates/since` in frontend state.

---

### 4. Sentinel Alerts Endpoint

#### **Endpoint:**
```http
GET /api/v1/sentinel/alerts
```

#### **Why We Need This:**
The Sentinel system generates **proactive alerts** based on market conditions and user behavior. We need to:
- Display alert history
- Show unread alerts
- Allow users to mark alerts as read
- Filter by alert type

Currently, we can only see new alerts via `/updates/since`, but we can't see historical alerts.

#### **Use Cases:**
1. **Alert Center**: Display all alerts in a dedicated section
2. **Unread Badge**: Show count of unread alerts
3. **Alert History**: Review past warnings and opportunities
4. **Filtering**: Filter by type, read/unread status

#### **User Flow:**
```
1. User clicks "Alerts" icon
2. Frontend calls GET /sentinel/alerts
3. Display list of alerts with unread count
4. User clicks alert → POST /sentinel/alerts/{id}/read
```

#### **Proposed Request:**
```http
GET /api/v1/sentinel/alerts
```

**Query Parameters:**
- `limit` (integer, optional) - Number of alerts to return (default: 50, max: 100)
- `is_read` (boolean, optional) - Filter by read status
- `alert_type` (string, optional) - Filter by type: `risk_warning`, `opportunity`, `info`

#### **Proposed Response:** `200 OK`
```json
{
  "alerts": [
    {
      "id": 15,
      "title": "High VIX Warning",
      "message": "VIX is up 5%. Historically, you lose money 80% of the time when VIX > 25.",
      "alert_type": "risk_warning",
      "severity": "high",
      "ticker": null,
      "similarity_score": 0.92,
      "is_read": false,
      "created_at": "2026-02-07T09:15:00Z"
    },
    {
      "id": 14,
      "title": "Strong Buy Signal",
      "message": "AAPL showing bullish divergence with 78% confidence",
      "alert_type": "opportunity",
      "severity": "medium",
      "ticker": "AAPL",
      "similarity_score": 0.85,
      "is_read": true,
      "created_at": "2026-02-06T14:30:00Z"
    }
  ],
  "total_count": 45,
  "unread_count": 12
}
```

#### **Field Descriptions:**
- `alert_type` - One of: `"risk_warning"`, `"opportunity"`, `"info"`
- `severity` - One of: `"low"`, `"medium"`, `"high"`
- `similarity_score` - How similar this situation is to past patterns (0.0 - 1.0)
- `ticker` - Related ticker symbol (null if market-wide alert)

#### **Related Endpoint (Already Exists):**
```http
POST /api/v1/sentinel/alerts/{id}/read
```
This marks an alert as read. We just need the GET endpoint to fetch them.

#### **Impact if Not Implemented:**
- ⚠️ No alert history
- ⚠️ Cannot review past warnings
- ⚠️ Limited value from Sentinel system

**Workaround**: Store `new_alert` events from `/updates/since` in frontend state.

---

### 5. Autonomous Config GET Endpoint

#### **Endpoint:**
```http
GET /api/v1/autonomous/config
```

#### **Why We Need This:**
You already have `POST /autonomous/config` to **update** the configuration, but we need `GET /autonomous/config` to **fetch** the current configuration.

Without this, we can't:
- Display current settings to the user
- Show what the bot is configured to do
- Pre-fill the configuration form

#### **Use Cases:**
1. **Display Current Config**: Show user what settings are active
2. **Form Pre-fill**: When user opens settings, show current values
3. **Validation**: Check if bot is configured correctly

#### **User Flow:**
```
1. User opens "Auto-Pilot Settings"
2. Frontend calls GET /autonomous/config
3. Display current settings (budget, max position size, etc.)
4. User changes settings → POST /autonomous/config
```

#### **Proposed Request:**
```http
GET /api/v1/autonomous/config
```

**No parameters needed.**

#### **Proposed Response:** `200 OK`
```json
{
  "is_autonomous_active": true,
  "total_budget": 5000.00,
  "current_allocation": 3200.00,
  "max_position_size": 1000.00,
  "max_drawdown": 500.00,
  "risk_tolerance": "medium",
  "allowed_symbols": ["AAPL", "NVDA", "MSFT", "GOOGL", "TSLA"],
  "min_confidence_threshold": 0.70
}
```

#### **Field Descriptions:**
- `is_autonomous_active` - Whether the bot is currently running
- `total_budget` - Total capital allocated to autonomous trading
- `current_allocation` - How much is currently deployed in positions
- `max_position_size` - Maximum size for a single position
- `max_drawdown` - Maximum allowed loss before stopping
- `risk_tolerance` - One of: `"low"`, `"medium"`, `"high"`
- `allowed_symbols` - List of tickers the bot can trade
- `min_confidence_threshold` - Minimum confidence to execute a trade

#### **Impact if Not Implemented:**
- ⚠️ Cannot display current configuration
- ⚠️ Settings form is always empty
- ⚠️ User doesn't know what the bot is doing

**Workaround**: Store config in frontend state after POST, but it's lost on page refresh.

---

## 📊 Priority Summary

| Endpoint | Priority | Impact | Workaround Available? |
|----------|----------|--------|----------------------|
| `GET /analysis/history/{ticker}` | 🔴 CRITICAL | Analysis tab non-functional | ❌ No |
| `GET /positions` | 🔴 CRITICAL | Empty positions on load | ✅ Yes (use `/updates/since`) |
| `GET /trades/history` | 🟡 HIGH | No trade history | ✅ Yes (store events) |
| `GET /sentinel/alerts` | 🟡 HIGH | No alert history | ✅ Yes (store events) |
| `GET /autonomous/config` | 🟡 HIGH | Cannot show settings | ✅ Yes (store after POST) |

---

## 🎯 Recommended Implementation Order

### Week 1 (Critical)
1. **`GET /analysis/history/{ticker}`** - Unblocks Analysis tab
2. **`GET /positions`** - Better UX on page load

### Week 2 (High Priority)
3. **`GET /autonomous/config`** - Complete autonomous features
4. **`GET /trades/history`** - Trade history display
5. **`GET /sentinel/alerts`** - Alert history display

---

## 💡 Implementation Notes

### Data Sources
All of these endpoints should be **reading from existing data** that you already have:
- Analysis history → Already stored from nightly runs
- Positions → Already tracked by Alpaca
- Trade history → Already logged in database
- Sentinel alerts → Already generated and stored
- Autonomous config → Already stored in database

**No new data collection needed** - just expose existing data via GET endpoints!

### Response Format Consistency
Please follow the same patterns as your existing endpoints:
- Use ISO 8601 timestamps (`"2026-02-07T09:15:00Z"`)
- Use consistent error format
- Include pagination for list endpoints
- Return empty arrays instead of null for empty lists

### Testing
We can help test these endpoints once implemented. Just let us know when they're ready!

---

## 📞 Questions?

If you have any questions about these endpoints or need clarification on:
- Response formats
- Use cases
- Priority levels
- Implementation details

Please reach out! We're happy to discuss and adjust as needed.

---

## ✅ Checklist for Backend Team

- [ ] `GET /analysis/history/{ticker}` implemented
- [ ] `GET /positions` implemented
- [ ] `GET /trades/history` implemented
- [ ] `GET /sentinel/alerts` implemented
- [ ] `GET /autonomous/config` implemented
- [ ] All endpoints tested and documented
- [ ] Response formats match specification
- [ ] Error handling implemented
- [ ] Frontend team notified when ready

---

**Thank you for your work on the API! Looking forward to full integration soon.** 🚀
