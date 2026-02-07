import { useState, useCallback } from "react";
import { tradesService } from "@/services/api";
import type { TradeRequest, TradeResponse, TradeHistoryItem } from "@/types/api";
import { logError } from "@/lib/errorHandler";

/**
 * Hook for trade execution and history
 */
export function useTrades() {
    const [executing, setExecuting] = useState(false);
    const [history, setHistory] = useState<TradeHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Execute a trade
    const executeTrade = useCallback(async (trade: TradeRequest): Promise<TradeResponse> => {
        try {
            setExecuting(true);
            setError(null);
            const response = await tradesService.executeTrade(trade);
            return response;
        } catch (err) {
            const error = err as Error;
            setError(error);
            logError(error, "useTrades.executeTrade");
            throw error;
        } finally {
            setExecuting(false);
        }
    }, []);

    // Fetch trade history
    const fetchHistory = useCallback(
        async (params?: {
            limit?: number;
            status?: "all" | "filled" | "pending" | "cancelled";
            symbol?: string;
            since?: number;
        }) => {
            try {
                setLoadingHistory(true);
                setError(null);
                const data = await tradesService.getHistory(params);
                setHistory(data);
            } catch (err) {
                const error = err as Error;
                setError(error);
                logError(error, "useTrades.fetchHistory");
            } finally {
                setLoadingHistory(false);
            }
        },
        []
    );

    return {
        executeTrade,
        executing,
        fetchHistory,
        history,
        loadingHistory,
        error,
    };
}
