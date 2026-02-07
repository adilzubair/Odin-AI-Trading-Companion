import type { MonitoredTicker, AnalysisResponse } from "@/types/api";

/**
 * Mock watchlist data
 */
export const mockWatchlist: MonitoredTicker[] = [
    {
        id: 1,
        symbol: "AAPL",
        is_active: true,
    },
    {
        id: 2,
        symbol: "NVDA",
        is_active: true,
    },
    {
        id: 3,
        symbol: "TSLA",
        is_active: true,
    },
];

/**
 * Mock analysis reports
 */
export const mockAnalysisReports: Record<string, AnalysisResponse> = {
    AAPL: {
        ticker: "AAPL",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        final_decision: "BUY",
        confidence: 0.78,
        market_report: "Apple continues to show strong fundamentals with robust iPhone sales and growing services revenue. The recent product launches have been well-received, and the company maintains a healthy balance sheet with significant cash reserves. Technical indicators suggest bullish momentum with price trading above key moving averages.",
        risk_debate: "Primary risks include potential regulatory challenges in the EU and China, supply chain dependencies, and market saturation in smartphone segment. However, the diversification into services and wearables provides revenue stability. Current valuation appears reasonable given growth prospects and market position.",
    },
    NVDA: {
        ticker: "NVDA",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        final_decision: "BUY",
        confidence: 0.85,
        market_report: "NVIDIA remains the dominant player in AI chip market with exceptional demand for H100 and upcoming Blackwell GPUs. Data center revenue continues to surge, driven by AI infrastructure buildout. The company's competitive moat in AI computing is strengthening, with major cloud providers and enterprises heavily investing in NVIDIA's ecosystem.",
        risk_debate: "Key risks include potential competition from AMD and custom chips from hyperscalers, export restrictions to China impacting revenue, and high valuation multiples. However, the AI revolution is still in early stages, and NVIDIA's technological lead and software ecosystem (CUDA) create significant barriers to entry. Near-term supply constraints may limit upside.",
    },
    TSLA: {
        ticker: "TSLA",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        final_decision: "HOLD",
        confidence: 0.62,
        market_report: "Tesla's vehicle deliveries show mixed signals with strong Cybertruck interest but pricing pressure in key markets. Energy storage business is growing rapidly and could become a significant revenue driver. FSD (Full Self-Driving) progress continues, though regulatory approval timeline remains uncertain. Competition in EV market is intensifying globally.",
        risk_debate: "Major concerns include increasing competition from traditional automakers and Chinese EV makers, margin compression from price cuts, and execution risks on new models. Elon Musk's divided attention across multiple companies adds uncertainty. However, Tesla maintains technological advantages in battery tech and manufacturing efficiency. Valuation remains elevated relative to traditional auto metrics.",
    },
};

/**
 * Get next ticker ID for adding new tickers
 */
export let nextTickerId = 4;

export function getNextTickerId(): number {
    return nextTickerId++;
}
