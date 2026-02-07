import apiClient from "../client";
import type {
    TradeRequest,
    TradeResponse,
    TradeHistoryItem,
} from "@/types/api";

/**
 * Trades Service
 * Handles trade execution and history
 */
export const tradesService = {
    /**
     * Execute a trade (buy or sell)
     */
    executeTrade: async (trade: TradeRequest): Promise<TradeResponse> => {
        const response = await apiClient.post<TradeResponse>("/trades/execute", trade);
        return response.data;
    },

    /**
     * Get trade history
     */
    getHistory: async (params?: {
        limit?: number;
        status?: "all" | "filled" | "pending" | "cancelled";
        symbol?: string;
        since?: number;
    }): Promise<TradeHistoryItem[]> => {
        const response = await apiClient.get<TradeHistoryItem[]>("/trades/history", {
            params,
        });
        return response.data;
    },
};
