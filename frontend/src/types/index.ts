// Ticker types
export type TickerType = "stock" | "crypto";

export interface Ticker {
    symbol: string;
    type: TickerType;
    name: string;
}

// Analysis types
export interface AgentAnalysis {
    agentType: "fundamentals" | "sentiment" | "technical" | "news";
    status: "analyzing" | "complete" | "error";
    verdict: "buy" | "sell" | "hold" | null;
    confidence: number;
    summary: string;
    timestamp: number;
}

export interface AnalysisReport {
    ticker: string;
    timestamp: number;
    analyses: AgentAnalysis[];
    finalVerdict: "buy" | "sell" | "hold";
    overallConfidence: number;
    bullishScore: number;
    bearishScore: number;
}

// Signal types
export type SignalSource = "mahoraga" | "tauric";
export type SignalCategory = "technical" | "fundamental" | "sentiment";

export interface Signal {
    id: string;
    source: SignalSource; // Internal use only
    category: SignalCategory; // Display to user
    ticker: string;
    action: "buy" | "sell" | "hold";
    confidence: number;
    reason: string;
    timestamp: number;
}

// Trading types
export interface Position {
    ticker: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercentage: number;
    timestamp: number;
}

export interface ActivityItem {
    id: string;
    type: "trade" | "signal" | "analysis";
    message: string;
    timestamp: number;
    ticker?: string;
}

export interface PortfolioStats {
    balance: number;
    totalValue: number;
    totalPnL: number;
    totalPnLPercentage: number;
    dayPnL: number;
    dayPnLPercentage: number;
    unrealizedPnL: number;
    realizedPnL: number;
}

export interface LLMCosts {
    totalSpend: number;
    totalApiCalls: number;
    model: string;
    tokensIn: number;
    tokensOut: number;
}

// Chart data types
export interface ChartDataPoint {
    timestamp: number;
    value: number;
}

export interface PerformanceChartData {
    portfolio: ChartDataPoint[];
    positions: ChartDataPoint[];
}

// Store state types
export interface AnalysisState {
    selectedTickers: Ticker[];
    liveAnalyses: Map<string, AgentAnalysis[]>;
    reports: AnalysisReport[];
    isAnalyzing: boolean;
}

export interface TraderState {
    portfolio: PortfolioStats;
    positions: Position[];
    signals: Signal[];
    activityFeed: ActivityItem[];
    llmCosts: LLMCosts;
    chartData: PerformanceChartData;
    isTrading: boolean;
}

// Trade tab types
export type Timeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "All";

export interface Stock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercentage: number;
    miniChartData: ChartDataPoint[];
}

export interface StockDetail extends Stock {
    chartData: Record<Timeframe, ChartDataPoint[]>;
}

export interface TradeOrder {
    id: string;
    type: "buy" | "sell";
    ticker: string;
    stockName: string;
    quantity: number;
    price: number;
    total: number;
    timestamp: number;
}

export interface TradeState {
    selectedStock: StockDetail | null;
    tradeOrders: TradeOrder[];
}
