import { create } from "zustand";
import type { Position, Signal, ActivityItem, PortfolioStats, LLMCosts, PerformanceChartData } from "@/types";

interface TraderStore {
    portfolio: PortfolioStats;
    positions: Position[];
    signals: Signal[];
    activityFeed: ActivityItem[];
    llmCosts: LLMCosts;
    chartData: PerformanceChartData;
    isTrading: boolean;

    // Actions
    updatePortfolio: (portfolio: Partial<PortfolioStats>) => void;
    addPosition: (position: Position) => void;
    updatePosition: (ticker: string, updates: Partial<Position>) => void;
    removePosition: (ticker: string) => void;
    addSignal: (signal: Signal) => void;
    addActivity: (activity: ActivityItem) => void;
    updateLLMCosts: (costs: Partial<LLMCosts>) => void;
    updateChartData: (data: Partial<PerformanceChartData>) => void;
    setIsTrading: (isTrading: boolean) => void;
}

export const useTraderStore = create<TraderStore>((set) => ({
    portfolio: {
        balance: 100000,
        totalValue: 100000,
        totalPnL: 0,
        totalPnLPercentage: 0,
        dayPnL: 0,
        dayPnLPercentage: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
    },
    positions: [],
    signals: [],
    activityFeed: [],
    llmCosts: {
        totalSpend: 0,
        totalApiCalls: 0,
        model: "GPT-4",
        tokensIn: 0,
        tokensOut: 0,
    },
    chartData: {
        portfolio: [],
        positions: [],
    },
    isTrading: false,

    updatePortfolio: (portfolio) =>
        set((state) => ({
            portfolio: { ...state.portfolio, ...portfolio },
        })),

    addPosition: (position) =>
        set((state) => {
            // Check if position with this ticker already exists
            const existingIndex = state.positions.findIndex((p) => p.ticker === position.ticker);

            if (existingIndex >= 0) {
                // Update existing position
                const updatedPositions = [...state.positions];
                updatedPositions[existingIndex] = position;
                return { positions: updatedPositions };
            } else {
                // Add new position
                return { positions: [...state.positions, position] };
            }
        }),

    updatePosition: (ticker, updates) =>
        set((state) => ({
            positions: state.positions.map((p) =>
                p.ticker === ticker ? { ...p, ...updates } : p
            ),
        })),

    removePosition: (ticker) =>
        set((state) => ({
            positions: state.positions.filter((p) => p.ticker !== ticker),
        })),

    addSignal: (signal) =>
        set((state) => ({
            signals: [signal, ...state.signals].slice(0, 50), // Keep last 50 signals
        })),

    addActivity: (activity) =>
        set((state) => ({
            activityFeed: [activity, ...state.activityFeed].slice(0, 100), // Keep last 100 activities
        })),

    updateLLMCosts: (costs) =>
        set((state) => ({
            llmCosts: { ...state.llmCosts, ...costs },
        })),

    updateChartData: (data) =>
        set((state) => ({
            chartData: {
                portfolio: data.portfolio || state.chartData.portfolio,
                positions: data.positions || state.chartData.positions,
            },
        })),

    setIsTrading: (isTrading) => set({ isTrading }),
}));
