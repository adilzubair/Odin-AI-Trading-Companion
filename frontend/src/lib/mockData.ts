// Mock data generator for development/testing

import type { Signal, ActivityItem, Position, AgentAnalysis } from "@/types";

export function generateMockSignal(ticker: string, source: "mahoraga" | "tauric"): Signal {
    const actions: ("buy" | "sell" | "hold")[] = ["buy", "sell", "hold"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const categories: ("technical" | "fundamental" | "sentiment")[] = ["technical", "fundamental", "sentiment"];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const reasons = {
        buy: [
            "Strong bullish sentiment detected across social media",
            "Technical indicators showing oversold conditions",
            "Positive earnings report and strong fundamentals",
            "Breaking above key resistance level",
        ],
        sell: [
            "Bearish divergence on technical indicators",
            "Negative sentiment trend on social platforms",
            "Approaching overbought territory",
            "Weak fundamentals and declining revenue",
        ],
        hold: [
            "Mixed signals from technical and fundamental analysis",
            "Consolidation phase, waiting for clearer direction",
            "Neutral sentiment with no strong catalysts",
            "Range-bound price action",
        ],
    };

    return {
        id: `${source}-${ticker}-${Date.now()}-${Math.random()}`,
        source,
        category,
        ticker,
        action,
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        reason: reasons[action][Math.floor(Math.random() * reasons[action].length)],
        timestamp: Date.now(),
    };
}

export function generateMockActivity(type: "trade" | "signal" | "analysis"): ActivityItem {
    const messages = {
        trade: [
            "Executed BUY order for 10 shares of AAPL at $175.50",
            "Executed SELL order for 5 shares of NVDA at $890.25",
            "Position opened: BTC at $45,230",
            "Position closed: ETH with +5.2% profit",
        ],
        signal: [
            "New BUY signal detected for MSFT (Confidence: 85%)",
            "SELL signal triggered for TSLA (Confidence: 78%)",
            "HOLD recommendation for GOOGL (Confidence: 72%)",
            "Combined signal: Strong BUY for SOL",
        ],
        analysis: [
            "Completed fundamental analysis for AAPL",
            "Sentiment analysis finished for NVDA - Bullish",
            "Technical analysis complete for BTC - Oversold",
            "News analysis: Positive outlook for tech sector",
        ],
    };

    return {
        id: `activity-${Date.now()}-${Math.random()}`,
        type,
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
        timestamp: Date.now() - Math.floor(Math.random() * 3600000), // Random time in last hour
    };
}

export function generateMockPosition(ticker: string): Position {
    const entryPrice = Math.random() * 1000 + 50;
    const priceChange = (Math.random() - 0.5) * 0.2; // -10% to +10%
    const currentPrice = entryPrice * (1 + priceChange);
    const quantity = Math.floor(Math.random() * 50) + 1;
    const pnl = (currentPrice - entryPrice) * quantity;
    const pnlPercentage = ((currentPrice - entryPrice) / entryPrice) * 100;

    return {
        ticker,
        quantity,
        entryPrice,
        currentPrice,
        pnl,
        pnlPercentage,
        timestamp: Date.now() - Math.floor(Math.random() * 86400000), // Random time in last day
    };
}

export function generateMockAgentAnalysis(
    agentType: "fundamentals" | "sentiment" | "technical" | "news"
): AgentAnalysis {
    const verdicts: ("buy" | "sell" | "hold")[] = ["buy", "sell", "hold"];
    const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

    const summaries = {
        fundamentals: {
            buy: "Strong revenue growth and healthy balance sheet. P/E ratio attractive compared to sector average.",
            sell: "Declining margins and increasing debt levels. Overvalued based on DCF analysis.",
            hold: "Fair valuation with stable fundamentals. No significant catalysts identified.",
        },
        sentiment: {
            buy: "Overwhelmingly positive sentiment across social platforms. Bullish mentions up 45%.",
            sell: "Negative sentiment trending. Bearish discussions dominating social media.",
            hold: "Neutral sentiment with mixed opinions. No clear directional bias.",
        },
        technical: {
            buy: "RSI showing oversold conditions. MACD bullish crossover detected. Price above 50-day MA.",
            sell: "Overbought on RSI. Bearish divergence on volume. Breaking below support.",
            hold: "Consolidating in range. No clear technical signals. Waiting for breakout.",
        },
        news: {
            buy: "Positive earnings beat. New product launch announced. Analyst upgrades.",
            sell: "Regulatory concerns. Management changes. Analyst downgrades.",
            hold: "Mixed news flow. No major catalysts. Market waiting for guidance.",
        },
    };

    return {
        agentType,
        status: "complete",
        verdict,
        confidence: Math.floor(Math.random() * 30) + 70,
        summary: summaries[agentType][verdict],
        timestamp: Date.now(),
    };
}
