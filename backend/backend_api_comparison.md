# Backend API Implementation Review

## 📊 Comparison: Requirements vs. Implementation

### ✅ What Backend Implemented

#### 1. Market Data Endpoints ✅ **CRITICAL - DELIVERED**
- ✅ `GET /market/quote/{symbol}` - Real-time quotes
- ✅ `GET /market/history/{symbol}` - Historical OHLCV data
- **Status**: Fully implemented, proxying Alpaca API

#### 2. Portfolio History ✅ **HIGH - DELIVERED**
- ✅ `GET /portfolio/history` - Account value over time
- **Status**: Implemented with daily snapshots

#### 3. Real-Time Updates ✅ **HIGH - DELIVERED**
- ✅ `GET /updates/since` - Polling endpoint for all updates
- **Status**: Implemented as recommended (Phase 1 - Polling)
- **Update Types Supported**:
  - `new_alert` - Sentinel alerts
  - `trade_executed` - Trade completions
  - `position_update` - Position changes

#### 4. Signals Endpoint ✅ **HIGH - DELIVERED**
- ✅ `GET /signals/recent` - Active trading signals
- **Status**: Implemented (decision was YES)

#### 5. Monitor/Watchlist ✅ **COMPLETE**
- ✅ `GET /monitor/list`
- ✅ `POST /monitor/add`
- ✅ `DELETE /monitor/remove`

#### 6. Autonomous Trading ✅ **COMPLETE**
- ✅ `GET /autonomous/status`
- ✅ `POST /autonomous/config`

#### 7. Observer ✅ **COMPLETE**
- ✅ `POST /observer/log`

#### 8. Trading ✅ **COMPLETE**
- ✅ `POST /trades/execute`

---

## ⚠️ Key Differences from Our Requirements

### 1. Market Quote Response Format
**Our Requirement:**
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

**Backend Implementation:**
```json
{
  "symbol": "AAPL",
  "bid_price": 263.24,
  "ask_price": 263.30,
  "bid_size": 100,
  "ask_size": 100
}
```

**Impact**: ❌ **BREAKING CHANGE**
- Missing: `name`, `price`, `change`, `change_percentage`, `volume`, `market_cap`, `timestamp`
- Different: Uses `bid_price`/`ask_price` instead of single `price`

**Frontend Fix Needed**: Update `marketService.ts` to handle bid/ask prices

---

### 2. Historical Data Response Format
**Our Requirement:**
```json
{
  "symbol": "AAPL",
  "timeframe": "1D",
  "interval": "5m",
  "data": [
    {
      "timestamp": 1698408000,  // Unix timestamp (number)
      "open": 176.20,
      "high": 178.80,
      "low": 175.90,
      "close": 178.50,
      "volume": 1200000
    }
  ]
}
```

**Backend Implementation:**
```json
{
  "symbol": "AAPL",
  "timeframe": "1d",
  "data": [
    {
      "timestamp": "2025-02-14T05:00:00+00:00",  // ISO string
      "open": 241.25,
      "high": 245.55,
      "low": 240.99,
      "close": 244.60,
      "volume": 40896227
    }
  ]
}
```

**Impact**: ⚠️ **MINOR CHANGE**
- Different: `timestamp` is ISO string instead of Unix timestamp
- Different: Timeframe values (`1d` vs `1D`)
- Missing: `interval` field in response

**Frontend Fix Needed**: Parse ISO timestamps, adjust timeframe values

---

### 3. Portfolio History Response Format
**Our Requirement:**
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

**Backend Implementation:**
```json
{
  "timeframe": "1M",
  "interval": "1d",
  "data": [
    {
      "timestamp": "2026-02-01T12:00:00Z",  // ISO string
      "total_value": 10500.00,
      "cash": 500.00,
      "positions_value": 10000.00,
      "day_pnl": 150.00,
      "pnl": 1250.00
    }
  ]
}
```

**Impact**: ⚠️ **MINOR CHANGE**
- Different: `timestamp` is ISO string instead of Unix timestamp
- Missing: `pnl_percentage`, `day_pnl_percentage`

**Frontend Fix Needed**: Parse ISO timestamps, calculate percentages on frontend

---

### 4. Signals Response Format
**Our Requirement:**
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

**Backend Implementation:**
```json
{
  "signals": [
    {
      "id": 193,
      "symbol": "NAKED",
      "source": "reddit",
      "sentiment": -0.10,
      "reason": "Reddit: Short Strangles vs Reverse Jaded Lizard...",
      "timestamp": "2026-02-06T16:56:07.067443"
    }
  ]
}
```

**Impact**: ❌ **BREAKING CHANGE**
- Missing: `category`, `action`, `confidence`, `status`, `expires_at`
- Different: Has `sentiment` instead of `action`/`confidence`
- Different: `id` is number instead of string

**Frontend Fix Needed**: Significant changes to signal display logic

---

### 5. Monitor/Watchlist Response Format
**Our Requirement:**
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "is_active": true,
    "added_at": "2023-10-20T10:00:00Z",
    "last_analyzed_at": "2023-10-27T08:00:00Z"
  }
]
```

**Backend Implementation:**
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "is_active": true
  }
]
```

**Impact**: ⚠️ **MINOR CHANGE**
- Missing: `added_at`, `last_analyzed_at`

**Frontend Fix Needed**: Remove display of timestamps in watchlist

---

### 6. Updates/Since Response Format
**Our Requirement:**
```json
{
  "updates": [...],
  "latest_timestamp": 1698408200
}
```

**Backend Implementation:**
```json
{
  "latest_timestamp": 1770426236.8456,  // Float with decimals
  "updates": [...]
}
```

**Impact**: ✅ **COMPATIBLE**
- Different: Timestamp has decimal precision (more accurate)
- Same structure, just more precise

**Frontend Fix Needed**: None (JavaScript handles this fine)

---

## ❌ What's Still Missing

### 1. Trade History Endpoint
**Required**: `GET /trades/history`
**Status**: ❌ **NOT DOCUMENTED**
**Impact**: Cannot display trade history in frontend
**Workaround**: Use `/updates/since` to catch `trade_executed` events

### 2. Positions Endpoint
**Required**: `GET /positions`
**Status**: ❌ **NOT DOCUMENTED**
**Impact**: Cannot display current positions
**Workaround**: Use `/updates/since` to catch `position_update` events

### 3. Sentinel Alerts Endpoint
**Required**: `GET /sentinel/alerts`
**Status**: ❌ **NOT DOCUMENTED**
**Impact**: Cannot display alert history
**Workaround**: Use `/updates/since` to catch `new_alert` events

### 4. Analysis History Endpoint
**Required**: `GET /analysis/history/{ticker}`
**Status**: ❌ **NOT DOCUMENTED**
**Impact**: Analysis tab cannot show reports
**Critical**: This is needed for the redesigned Analysis tab!

### 5. Autonomous Config GET Endpoint
**Required**: `GET /autonomous/config`
**Status**: ❌ **NOT DOCUMENTED** (only POST is documented)
**Impact**: Cannot display current configuration
**Workaround**: Store config in frontend state after POST

---

## 🔧 Frontend Changes Required

### Priority 1: CRITICAL (Blocks Core Features)

#### 1.1 Update Market Service
**File**: `src/services/api/endpoints/market.ts`

**Changes Needed**:
```typescript
// OLD (Expected)
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  change_percentage: number;
  // ...
}

// NEW (Actual Backend)
interface StockQuote {
  symbol: string;
  bid_price: number;
  ask_price: number;
  bid_size: number;
  ask_size: number;
}

// Helper to calculate mid-price
function getMidPrice(quote: StockQuote): number {
  return (quote.bid_price + quote.ask_price) / 2;
}
```

#### 1.2 Update Historical Data Parsing
**File**: `src/services/api/endpoints/market.ts`

**Changes Needed**:
```typescript
// Parse ISO timestamp to Unix timestamp
data.map(candle => ({
  ...candle,
  timestamp: new Date(candle.timestamp).getTime() / 1000
}))
```

#### 1.3 Update Signals Type
**File**: `src/types/api.ts`

**Changes Needed**:
```typescript
export interface BackendSignal {
  id: number;  // Changed from string
  source: string;  // More flexible (not just "mahoraga" | "tauric")
  symbol: string;
  sentiment: number;  // NEW field
  reason: string;
  timestamp: string;
  // REMOVED: category, action, confidence, status, expires_at
}
```

#### 1.4 Add Missing Endpoints
**Files to Create/Update**:
- `src/services/api/endpoints/trades.ts` - Add `getTradeHistory()`
- `src/services/api/endpoints/positions.ts` - Add `getPositions()`
- `src/services/api/endpoints/sentinel.ts` - Add `getAlerts()`
- `src/services/api/endpoints/monitor.ts` - Add `getAnalysisHistory(ticker)`

**Workaround**: Use `/updates/since` and build state from events

---

### Priority 2: HIGH (Improves UX)

#### 2.1 Remove Timestamp Fields from Watchlist
**File**: `src/components/tabs/AnalysisTab.tsx`

**Changes Needed**:
- Remove display of `added_at`
- Remove display of `last_analyzed_at`
- Show message: "Analysis runs nightly at 8 AM"

#### 2.2 Calculate PnL Percentages
**File**: `src/hooks/api/usePortfolioHistory.ts` (if created)

**Changes Needed**:
```typescript
// Calculate missing percentages
data.map(point => ({
  ...point,
  pnl_percentage: (point.pnl / (point.total_value - point.pnl)) * 100,
  day_pnl_percentage: (point.day_pnl / point.total_value) * 100
}))
```

---

### Priority 3: MEDIUM (Nice to Have)

#### 3.1 Update Timeframe Values
**File**: `src/components/trade/StockDetail.tsx`

**Changes Needed**:
```typescript
// OLD
const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y"];

// NEW (match backend)
const timeframes = ["1m", "5m", "15m", "1h", "1d"];
```

---

## 📋 Action Items for Backend Team

### Critical Requests

1. **Add Analysis History Endpoint** 🔴
   ```
   GET /analysis/history/{ticker}
   ```
   This is needed for the Analysis tab to display reports!

2. **Add Positions Endpoint** 🔴
   ```
   GET /positions
   ```
   Current positions list is needed on page load

3. **Add Trade History Endpoint** 🟡
   ```
   GET /trades/history
   ```
   Trade history display

4. **Add Sentinel Alerts Endpoint** 🟡
   ```
   GET /sentinel/alerts
   ```
   Alert history display

5. **Add Autonomous Config GET** 🟡
   ```
   GET /autonomous/config
   ```
   Display current configuration

### Enhancement Requests

6. **Add Fields to Market Quote** 🟢
   - `name` - Company name
   - `change` - Price change ($)
   - `change_percentage` - Price change (%)
   - `volume` - Trading volume
   - `timestamp` - Quote timestamp

7. **Add Fields to Watchlist** 🟢
   - `added_at` - When ticker was added
   - `last_analyzed_at` - Last analysis timestamp

8. **Add Fields to Signals** 🟢
   - `category` - Signal category
   - `action` - Buy/Sell/Hold
   - `confidence` - Confidence score (0-1)
   - `status` - Active/Executed/Expired

---

## 🎯 Integration Strategy

### Phase 1: Immediate (This Week)
1. ✅ Update MSW mocks to match backend response formats
2. ✅ Update TypeScript types to match backend
3. ✅ Update market service to handle bid/ask prices
4. ✅ Update timestamp parsing (ISO → Unix)
5. ✅ Test with real backend endpoints

### Phase 2: Short-term (Next Week)
1. ⏳ Request missing endpoints from backend
2. ⏳ Implement workarounds using `/updates/since`
3. ⏳ Update UI to remove unavailable fields
4. ⏳ Add percentage calculations on frontend

### Phase 3: Long-term (Future)
1. 🔮 Request enhancement fields from backend
2. 🔮 Implement WebSocket (if backend adds it)
3. 🔮 Add advanced features

---

## ✅ Summary

### What Works ✅
- ✅ Market data (with format changes)
- ✅ Portfolio history (with format changes)
- ✅ Real-time updates via polling
- ✅ Signals (with format changes)
- ✅ Watchlist management
- ✅ Autonomous control
- ✅ Observer logging
- ✅ Trade execution

### What Needs Frontend Updates ⚠️
- ⚠️ Market quote parsing (bid/ask → price)
- ⚠️ Timestamp parsing (ISO → Unix)
- ⚠️ Signal display (different fields)
- ⚠️ Watchlist display (fewer fields)
- ⚠️ PnL percentage calculations

### What's Missing ❌
- ❌ Analysis history endpoint (CRITICAL!)
- ❌ Positions endpoint
- ❌ Trade history endpoint
- ❌ Sentinel alerts endpoint
- ❌ Autonomous config GET endpoint

### Overall Assessment
**Status**: 🟡 **70% Ready for Integration**

**Blockers**:
1. Analysis history endpoint (needed for Analysis tab)
2. Positions endpoint (needed for initial load)

**Recommendation**: 
- Start integration with available endpoints
- Use MSW mocks for missing endpoints
- Request critical missing endpoints from backend
- Update frontend code to match actual response formats
