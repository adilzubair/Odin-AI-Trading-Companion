import type { TradeHistoryItem, BackendPosition, SentinelAlert } from "@/types/api";

/**
 * Mock trade history
 */
export const mockTradeHistory: TradeHistoryItem[] = [
    {
        id: "trade_001",
        symbol: "AAPL",
        side: "buy",
        quantity: 10,
        price: 185.50,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "filled",
        total_value: 1855.00,
    },
    {
        id: "trade_002",
        symbol: "NVDA",
        side: "buy",
        quantity: 5,
        price: 722.30,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "filled",
        total_value: 3611.50,
    },
    {
        id: "trade_003",
        symbol: "TSLA",
        side: "sell",
        quantity: 8,
        price: 195.75,
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: "filled",
        total_value: 1566.00,
    },
];

/**
 * Mock positions
 */
export const mockPositions: BackendPosition[] = [
    {
        symbol: "AAPL",
        quantity: 10,
        avg_entry_price: 185.50,
        current_price: 188.20,
        unrealized_pnl: 27.00,
        unrealized_pnl_percent: 1.45,
        market_value: 1882.00,
    },
    {
        symbol: "NVDA",
        quantity: 5,
        avg_entry_price: 722.30,
        current_price: 735.80,
        unrealized_pnl: 67.50,
        unrealized_pnl_percent: 1.87,
        market_value: 3679.00,
    },
    {
        symbol: "MSFT",
        quantity: 15,
        avg_entry_price: 410.25,
        current_price: 408.90,
        unrealized_pnl: -20.25,
        unrealized_pnl_percent: -0.33,
        market_value: 6133.50,
    },
];

/**
 * Mock Sentinel alerts
 */
export const mockSentinelAlerts: SentinelAlert[] = [
    {
        id: 1,
        alert_type: "risk_warning",
        severity: "high",
        message: "Portfolio concentration risk: NVDA position exceeds 30% of total portfolio value",
        ticker: "NVDA",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: 2,
        alert_type: "opportunity",
        severity: "medium",
        message: "Strong buy signal detected for AAPL based on recent analysis with 78% confidence",
        ticker: "AAPL",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: 3,
        alert_type: "info",
        severity: "low",
        message: "MSFT position is down 0.33% today. Consider reviewing stop-loss settings",
        ticker: "MSFT",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_read: true,
    },
];
