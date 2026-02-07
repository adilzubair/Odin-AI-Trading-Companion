import { create } from "zustand";
import type { StockDetail, TradeOrder } from "@/types";

interface TradeStore {
    selectedStock: StockDetail | null;
    tradeOrders: TradeOrder[];

    // Actions
    setSelectedStock: (stock: StockDetail | null) => void;
    executeTrade: (order: Omit<TradeOrder, "id" | "timestamp">) => void;
    clearSelectedStock: () => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
    selectedStock: null,
    tradeOrders: [],

    setSelectedStock: (stock) => set({ selectedStock: stock }),

    executeTrade: (order) =>
        set((state) => ({
            tradeOrders: [
                {
                    ...order,
                    id: `trade-${Date.now()}-${Math.random()}`,
                    timestamp: Date.now(),
                },
                ...state.tradeOrders,
            ].slice(0, 100), // Keep last 100 trades
        })),

    clearSelectedStock: () => set({ selectedStock: null }),
}));
