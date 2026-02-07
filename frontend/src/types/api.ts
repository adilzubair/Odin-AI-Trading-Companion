// Backend API Response Types

// ============================================================================
// Monitor/Watchlist Types
// ============================================================================

export interface MonitoredTicker {
    id: number;
    symbol: string;
    is_active: boolean;
    added_at?: string;
    last_analyzed_at?: string | null;  // Backend doesn't return this
}

export interface AnalysisResponse {
    ticker: string;
    trade_date?: string;  // Backend uses this instead of timestamp
    final_decision: "BUY" | "SELL" | "HOLD";
    confidence: number;
    market_report: string;
    risk_debate: string | { judge_decision?: string;[key: string]: any };
    timestamp?: string;
    created_at?: string;
}

// Analysis history response (NEW - backend implemented)
export interface AnalysisHistoryResponse {
    ticker: string;
    reports: AnalysisResponse[];
}

export interface AddTickerRequest {
    symbol: string;
}

export interface RemoveTickerRequest {
    symbol: string;
}

// ============================================================================
// Autonomous Trading Types
// ============================================================================

export interface AutonomousStatus {
    is_active?: boolean;
    enabled?: boolean;
    last_trade_at?: string;
    total_trades_today?: number;
    success_rate?: number;
    current_positions?: number;
    signals_count?: number;
    open_positions?: number;
    account_value?: number;
    cash?: number;
}

export interface AutonomousConfig {
    is_autonomous_active: boolean;
    max_position_size: number;
    max_daily_trades?: number;
    risk_tolerance?: string;
    allowed_symbols?: string[];
    min_confidence_threshold?: number;
    total_budget?: number;
    current_allocation?: number;
    max_drawdown?: number;
}

export interface UpdateConfigRequest {
    is_autonomous_active?: boolean;
    total_budget?: number;
    max_position_size?: number;
    max_drawdown?: number;
}

// ============================================================================
// Trading Types
// ============================================================================

export interface TradeRequest {
    symbol: string;
    quantity: number;
    side: "buy" | "sell";
    reason?: string;
    limit_price?: number;
}

export interface TradeResponse {
    order_id?: string;
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    status: "submitted" | "filled" | "rejected" | "pending";
    filled_price?: number;
    timestamp: string;
    message?: string;
    trade_id?: string;
}

export interface TradeHistoryItem {
    id: string;
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    price: number;
    total_value?: number;
    total?: number;
    status: "pending" | "filled" | "cancelled" | "rejected";
    timestamp?: string;
    reason?: string;
    created_at?: string;
    filled_at?: string;
    source?: "manual" | "autonomous";
}

export interface BackendPosition {
    symbol: string;
    quantity: number;
    entry_price?: number;
    avg_entry_price?: number;
    current_price: number;
    unrealized_pnl?: number;
    unrealized_pnl_percent?: number;
    market_value?: number;
    pnl?: number;
    pnl_pct?: number;
    side?: "long" | "short";
}

// Positions snapshot response (NEW - backend implemented)
export interface PositionsResponse {
    positions: BackendPosition[];
    total_market_value: number;
    total_unrealized_pnl: number;
}

// Trade history response (NEW - backend implemented)
export interface TradeHistoryResponse {
    trades: TradeHistoryItem[];
    total_count: number;
}

// ============================================================================
// Market Data Types (Placeholder - will be implemented by backend)
// ============================================================================

// Backend returns bid/ask prices from Alpaca
export interface StockQuote {
    symbol: string;
    bid_price: number;
    ask_price: number;
    bid_size: number;
    ask_size: number;
}

// Helper type for frontend display (calculated from bid/ask)
export interface DisplayQuote {
    symbol: string;
    price: number;  // Mid-price: (bid + ask) / 2
    bid_price: number;
    ask_price: number;
    spread: number;  // ask - bid
}

// Backend returns ISO timestamp strings
export interface HistoricalDataPoint {
    timestamp: string;  // ISO 8601 format: "2025-02-14T05:00:00+00:00"
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface HistoricalData {
    symbol: string;
    timeframe: string;  // e.g., "1d", "1h", "5m"
    data: HistoricalDataPoint[];
    // Note: interval field not returned by backend
}

export interface BatchQuotesRequest {
    symbols: string[];
}

export interface BatchQuotesResponse {
    quotes: StockQuote[];
    timestamp: string;
}

// ============================================================================
// Observer Types
// ============================================================================

export type ObserverActivityType =
    | "chart_view"
    | "timeframe_change"
    | "trade_consideration"
    | "quantity_input"
    | "trade_executed"
    | "stock_search"
    | "watchlist_add"
    | "watchlist_remove";

export interface ObserverEvent {
    activity_type: ObserverActivityType;
    symbol?: string;
    client_context: string;
    timestamp?: number;
}

export interface LogActionRequest {
    activity_type: ObserverActivityType;
    symbol?: string;
    client_context: string;
}

// ============================================================================
// Sentinel Types
// ============================================================================

export interface SentinelAlert {
    id: number;
    title?: string;
    message: string;
    alert_type: "risk_warning" | "opportunity" | "info";
    severity?: "low" | "medium" | "high";
    ticker?: string;
    timestamp?: string;
    similarity_score?: number;
    is_read: boolean;
    created_at?: string;
}

export interface MarkReadRequest {
    alert_id: number;
}

// ============================================================================
// Signal Types (if exposed by backend)
// ============================================================================

// Backend signal format (actual implementation)
export interface BackendSignal {
    id: number;  // Changed from string
    symbol: string;
    source: string;  // e.g., "reddit", "mahoraga", "tauric"
    sentiment: number;  // -1.0 to 1.0
    reason: string;
    timestamp: string;  // ISO 8601 format
    // Note: category, action, confidence, status, expires_at not returned by backend
}

// ============================================================================
// Portfolio History Types
// ============================================================================

// Backend returns ISO timestamps and missing percentage fields
export interface PortfolioHistoryPoint {
    timestamp: string;  // ISO 8601 format
    total_value: number;
    cash: number;
    positions_value: number;
    day_pnl: number;
    pnl: number;
    // Note: pnl_percentage and day_pnl_percentage not returned by backend
    // Calculate on frontend if needed
}

export interface PortfolioHistory {
    timeframe: string;  // e.g., "1M", "1W", "3M", "1Y"
    interval: string;   // e.g., "1d"
    data: PortfolioHistoryPoint[];
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp?: string;
}

export interface ErrorResponse {
    error: ApiError;
}

// Standard error codes
export type ApiErrorCode =
    | "INVALID_SYMBOL"
    | "INVALID_QUANTITY"
    | "INSUFFICIENT_FUNDS"
    | "GUARDRAIL_VIOLATION"
    | "INVALID_API_KEY"
    | "MARKET_CLOSED"
    | "POSITION_NOT_FOUND"
    | "RATE_LIMIT_EXCEEDED"
    | "SERVICE_UNAVAILABLE"
    | "UNKNOWN_ERROR";

// ============================================================================
// Real-time Updates Types
// ============================================================================

export type UpdateType =
    | "position_update"
    | "new_alert"
    | "trade_executed"
    | "signal_generated"
    | "analysis_completed";

export interface Update {
    type: UpdateType;
    timestamp: number;
    data: any;
}

export interface UpdatesResponse {
    updates: Update[];
    latest_timestamp: number;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginatedResponse<T> {
    data: T[];
    total_count: number;
    page: number;
    page_size: number;
}
