import type { AutonomousStatus, AutonomousConfig } from "@/types/api";

/**
 * Mock autonomous trading status
 */
export const mockAutonomousStatus: AutonomousStatus = {
    is_active: false,
    last_trade_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    total_trades_today: 3,
    success_rate: 0.67,
    current_positions: 5,
};

/**
 * Mock autonomous trading configuration
 */
export const mockAutonomousConfig: AutonomousConfig = {
    is_autonomous_active: false,
    max_position_size: 1000,
    max_daily_trades: 10,
    risk_tolerance: "medium",
    allowed_symbols: ["AAPL", "NVDA", "MSFT", "GOOGL", "TSLA", "AMZN"],
    min_confidence_threshold: 0.7,
};
