import { create } from "zustand";
import type { StockDetail, TradeOrder } from "@/types";

// Types for Portfolio
export interface Position {
    ticker: string;
    stockName: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number; // For real-time updates (mocked for now as last trade price)
    totalValue: number;
    change: number; // $ change
    changePercentage: number; // % change
}

export interface Portfolio {
    investedAmount: number;
    cashBalance: number;
    currentBalance: number;
    totalReturns: number;
    totalReturnsPercentage: number;
}

interface TradeStore {
    selectedStock: StockDetail | null;
    tradeOrders: TradeOrder[];
    portfolio: Portfolio;
    positions: Position[];

    // Actions
    setSelectedStock: (stock: StockDetail | null) => void;
    executeTrade: (order: Omit<TradeOrder, "id" | "timestamp">) => void;
    clearSelectedStock: () => void;
    updatePositionPrice: (ticker: string, newPrice: number) => void; // To simulate live updates if needed
}

export const useTradeStore = create<TradeStore>((set) => ({
    selectedStock: null,
    tradeOrders: [],
    portfolio: {
        investedAmount: 0,
        cashBalance: 1000000,
        currentBalance: 1000000,
        totalReturns: 0,
        totalReturnsPercentage: 0
    },
    positions: [],

    setSelectedStock: (stock) => set({ selectedStock: stock }),

    executeTrade: (order) =>
        set((state) => {
            const orderTotal = order.total;
            const isBuy = order.type === 'buy';

            // Safe Cash Balance access with fallback to 1M if undefined
            let newCashBalance = state.portfolio.cashBalance ?? 1000000;

            // Insufficient Funds Check for Buy
            if (isBuy && orderTotal > newCashBalance) {
                console.error("Insufficient funds");
                return state;
            }

            // Update Cash Balance
            if (isBuy) {
                newCashBalance -= orderTotal;
            } else {
                newCashBalance += orderTotal;
            }

            // New positions array
            let newPositions = [...state.positions];
            const existingPositionIndex = newPositions.findIndex(p => p.ticker === order.ticker);

            if (isBuy) {
                if (existingPositionIndex !== -1) {
                    // Update existing position
                    const pos = newPositions[existingPositionIndex];
                    const totalCost = (pos.quantity * pos.avgPrice) + orderTotal;
                    const newQuantity = pos.quantity + order.quantity;
                    const newAvgPrice = totalCost / newQuantity;

                    newPositions[existingPositionIndex] = {
                        ...pos,
                        quantity: newQuantity,
                        avgPrice: newAvgPrice,
                        currentPrice: order.price,
                        totalValue: newQuantity * order.price,
                    };
                } else {
                    // Add new position
                    newPositions.push({
                        ticker: order.ticker,
                        stockName: order.stockName,
                        quantity: order.quantity,
                        avgPrice: order.price,
                        currentPrice: order.price,
                        totalValue: orderTotal,
                        change: 0,
                        changePercentage: 0
                    });
                }
            } else {
                // Handle Sell
                if (existingPositionIndex !== -1) {
                    const pos = newPositions[existingPositionIndex];
                    const newQuantity = pos.quantity - order.quantity;

                    if (newQuantity <= 0) {
                        newPositions.splice(existingPositionIndex, 1);
                    } else {
                        newPositions[existingPositionIndex] = {
                            ...pos,
                            quantity: newQuantity,
                            totalValue: newQuantity * order.price
                        };
                    }
                }
            }

            // Recalculate Portfolio Summary
            const investedAmount = newPositions.reduce((sum, p) => sum + (p.quantity * p.avgPrice), 0);
            const portfolioValue = newPositions.reduce((sum, p) => sum + p.totalValue, 0);

            // Total Account Value = Cash + Portfolio Value
            // This ensures total value doesn't artificially inflate on buy. 
            // e.g. Start 1M. Buy 100k. Cash 900k + Stock 100k = 1M. Correct.
            const currentTotalBalance = newCashBalance + portfolioValue;

            // Total Returns
            const totalReturns = currentTotalBalance - 1000000;
            const totalReturnsPercentage = (totalReturns / 1000000) * 100;

            return {
                tradeOrders: [
                    {
                        ...order,
                        id: `trade-${Date.now()}-${Math.random()}`,
                        timestamp: Date.now(),
                    },
                    ...state.tradeOrders,
                ].slice(0, 100),
                positions: newPositions,
                portfolio: {
                    investedAmount,
                    cashBalance: newCashBalance,
                    currentBalance: currentTotalBalance,
                    totalReturns,
                    totalReturnsPercentage
                }
            };
        }),

    clearSelectedStock: () => set({ selectedStock: null }),

    updatePositionPrice: (ticker, newPrice) => set((state) => {
        const newPositions = state.positions.map(p => {
            if (p.ticker === ticker) {
                const currentPrice = newPrice;
                const totalValue = p.quantity * currentPrice;
                const costBasis = p.quantity * p.avgPrice;
                const change = totalValue - costBasis;
                const changePercentage = (change / costBasis) * 100;

                return { ...p, currentPrice, totalValue, change, changePercentage };
            }
            return p;
        });

        // Re-sum portfolio
        const investedAmount = newPositions.reduce((sum, p) => sum + (p.quantity * p.avgPrice), 0);
        const portfolioValue = newPositions.reduce((sum, p) => sum + p.totalValue, 0);

        // Safe Cash Balance access with fallback
        const cashBalance = state.portfolio.cashBalance ?? 1000000;

        // Total Account Value = Cash + Portfolio Value
        const currentTotalBalance = cashBalance + portfolioValue;

        const totalReturns = currentTotalBalance - 1000000;
        const totalReturnsPercentage = (totalReturns / 1000000) * 100;

        return {
            positions: newPositions,
            portfolio: {
                ...state.portfolio,
                investedAmount,
                cashBalance,
                currentBalance: currentTotalBalance,
                totalReturns,
                totalReturnsPercentage
            }
        };
    })
}));
