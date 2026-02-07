"use client";

import { useEffect } from "react";
import { useTraderStore } from "@/store/useTraderStore";
import { generateMockSignal, generateMockActivity, generateMockPosition } from "@/lib/mockData";
import { generateChartData, updateChartData } from "@/lib/chartData";

export function useMockData() {
    const { addSignal, addActivity, addPosition, updatePortfolio, updateLLMCosts, updateChartData: setChartData, chartData } = useTraderStore();

    useEffect(() => {
        // Add mock positions
        addPosition(generateMockPosition("AAPL"));
        addPosition(generateMockPosition("NVDA"));
        addPosition(generateMockPosition("BTC"));

        // Add mock signals
        addSignal(generateMockSignal("MSFT", "mahoraga"));
        addSignal(generateMockSignal("ETH", "tauric"));
        addSignal(generateMockSignal("GOOGL", "mahoraga"));
        addSignal(generateMockSignal("SOL", "tauric"));

        // Add mock activities
        for (let i = 0; i < 10; i++) {
            const types: ("trade" | "signal" | "analysis")[] = ["trade", "signal", "analysis"];
            const randomType = types[Math.floor(Math.random() * types.length)];
            addActivity(generateMockActivity(randomType));
        }

        // Update portfolio
        updatePortfolio({
            balance: 95000.01,
            totalValue: 104949.40,
            totalPnL: 4949.39,
            totalPnLPercentage: 4.95,
            dayPnL: -50.37,
            dayPnLPercentage: -0.05,
            unrealizedPnL: 3200.15,
            realizedPnL: 1749.24,
        });

        // Update LLM costs
        updateLLMCosts({
            totalSpend: 45.67,
            totalApiCalls: 234,
            model: "GPT-4",
            tokensIn: 125430,
            tokensOut: 45230,
        });

        // Initialize chart data
        setChartData({
            portfolio: generateChartData(100000, 24),
            positions: generateChartData(50000, 24),
        });

        // Simulate WebSocket updates every 3 seconds
        const interval = setInterval(() => {
            // Get fresh data from store
            const currentData = useTraderStore.getState().chartData;
            setChartData({
                portfolio: updateChartData(currentData.portfolio, 100000),
                positions: updateChartData(currentData.positions, 50000),
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);
}
