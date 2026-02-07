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
        currentBalance: 0,
        totalReturns: 0,
        totalReturnsPercentage: 0
    },
    positions: [],

    setSelectedStock: (stock) => set({ selectedStock: stock }),

    executeTrade: (order) =>
        set((state) => {
            // Calculate new portfolio state
            const orderTotal = order.total;
            const isBuy = order.type === 'buy';

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
                        currentPrice: order.price, // Update current price to latest trade
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
                // Handle Sell (assume we can sell only what we have for now, though store doesn't enforce check yet)
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
            // Mock: Invested Amount matches current hold cost for simplicity of this mock phase
            const investedAmount = newPositions.reduce((sum, p) => sum + (p.quantity * p.avgPrice), 0);
            const currentBalance = newPositions.reduce((sum, p) => sum + p.totalValue, 0);
            const totalReturns = currentBalance - investedAmount;
            const totalReturnsPercentage = investedAmount > 0 ? (totalReturns / investedAmount) * 100 : 0;

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
                    currentBalance,
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
        const currentBalance = newPositions.reduce((sum, p) => sum + p.totalValue, 0);
        const totalReturns = currentBalance - investedAmount;
        const totalReturnsPercentage = investedAmount > 0 ? (totalReturns / investedAmount) * 100 : 0;

        return {
            positions: newPositions,
            portfolio: {
                investedAmount,
                currentBalance,
                totalReturns,
                totalReturnsPercentage
            }
        };
    })
}));
