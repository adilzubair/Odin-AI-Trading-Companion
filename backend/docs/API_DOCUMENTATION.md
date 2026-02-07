# 🧠 PsyTrade API Specification
**Version:** 1.1.0  
**Status:** Production Ready  
**Base URL:** `http://localhost:8000/api/v1`

---

## 🔐 Authentication
Every request must include the **API Key** in the header.
*   **Header Name:** `X-API-Key`
*   **Default Dev Key:** `dev_secret_key` (See `.env`)

---

## 1. 📺 The Monitor (Smart Watchlist)
*Users add tickers here to get daily "Morning Reports" from the agent swarm.*

### 1.1 Get Watchlist
**`GET /monitor/list`**  
Returns all active tickers the user is tracking.
*   **Response:** `List[MonitoredTicker]`
    ```json
    [
      {
        "id": 1,
        "symbol": "AAPL",
        "is_active": true,
        "last_analyzed_at": "2023-10-27T08:00:00"
      }
    ]
    ```

### 1.2 Add Ticker
**`POST /monitor/add`**  
Adds a ticker to the nightly analysis schedule.
*   **Body:**
    ```json
    { "symbol": "NVDA" }
    ```

### 1.3 Remove Ticker
**`DELETE /monitor/remove`**  
*   **Body:**
    ```json
    { "symbol": "NVDA" }
    ```

### 1.4 Get Analysis Reports
*(Frontend Pattern: Call Get Watchlist -> Iterate -> Call Get History)*
**`GET /analysis/history/{ticker}`**
*   **Params:** `limit=1` (For latest daily report)
*   **Response:** `List[AnalysisResponse]`
    ```json
    [
      {
        "ticker": "AAPL",
        "final_decision": "BUY",
        "confidence": 0.85,
        "market_report": "Bullish trend confirmed...",
        "risk_debate": "Volatility is high but risk/reward is favorable...",
        "created_at": "2023-10-27T08:00:00"
      }
    ]
    ```

---

## 2. 🤖 Auto-Pilot (Autonomous Trading)
*Controls the background trading engine that hunts for signals 24/7.*

### 2.1 Get Status (The "Cockpit")
**`GET /autonomous/status`**  
Real-time heartbeat of the engine.
*   **Response:**
    ```json
    {
      "enabled": true,
      "signals_count": 12,      // Signals found in last 24h
      "open_positions": 2,      // Currently held positions
      "account_value": 1050.25, // Total Portfolio Value
      "cash": 800.00            // Available Cash
    }
    ```

### 2.2 Get Configuration
**`GET /autonomous/config`**  
View current budget and risk settings.
*   **Response:**
    ```json
    {
      "is_autonomous_active": true,
      "total_budget": 1000.0,
      "current_allocation": 250.0,
      "max_position_size": 100.0,  // Max $ per trade
      "max_drawdown": 0.10         // Hard stop at 10% loss
    }
    ```

### 2.3 Update Configuration (Control Panel)
**`POST /autonomous/config`**  
Use this to **Start/Stop** the bot or **Change Budget**.
*   **Body:** (Send only what you want to change)
    ```json
    {
      "is_autonomous_active": false, // Emergency Stop
      "total_budget": 5000.0         // Increase Budget
    }
    ```

---

## 3. 👁️ The Observer (PsyTrade Tracking)
*Tracks manual user actions to build the "Trader DNA".*

### 3.1 Log User Action
**`POST /observer/log`**  
Frontend MUST call this when user interacts with UI (e.g., clicks "Buy", views a chart).
*   **Body:**
    ```json
    {
      "activity_type": "chart_view",
      "symbol": "BTCUSD",
      "client_context": "User spent 5 minutes on the 1H chart."
    }
    ```

### 3.2 Manual Trade (Buy/Sell)
**`POST /trades/execute`**  
Executes a real trade AND logs it to the Observer automatically.
*   **Body:**
    ```json
    {
      "symbol": "TSLA",
      "quantity": 5,
      "side": "buy",
      "reason": "I like the breakout pattern"
    }
    ```
*   **Response:**
    ```json
    {
      "status": "submitted",
      "message": "Order submitted and logged to Observer."
    }
    ```

---

## 4. 🛡️ The Sentinel (Proactive Alerts)
*Delivers "News-to-History" alerts.*

### 4.1 Get Alerts
**`GET /sentinel/alerts`**  
*   **Response:**
    ```json
    [
      {
        "id": 10,
        "title": "Danger: High VIX",
        "message": "VIX is up 5%. In the past, you lost money 80% of the time when VIX > 25.",
        "alert_type": "risk_warning",
        "similarity_score": 0.92,
        "is_read": false
      }
    ]
    ```

### 4.2 Mark Read
**`POST /sentinel/alerts/{id}/read`**

---

## 5. 📊 General Data

### 5.1 Positions
**`GET /positions?status=open`**
*   **Response:**
    ```json
    [
      {
        "symbol": "AAPL",
        "quantity": 10,
        "entry_price": 150.0,
        "current_price": 155.0,
        "pnl": 50.0,
        "pnl_pct": 3.33
      }
    ]
    ```

### 5.2 Trade History
**`GET /trades/history`**

### 5.3 Health Check
**`GET /health`**
