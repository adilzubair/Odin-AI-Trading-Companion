import apiClient from "../client";
import type {
    MonitoredTicker,
    AnalysisResponse,
    AddTickerRequest,
    RemoveTickerRequest,
} from "@/types/api";

/**
 * Monitor/Watchlist Service
 * Handles watchlist management and analysis reports
 */
export const monitorService = {
    /**
     * Get all tickers in the watchlist
     */
    getWatchlist: async (): Promise<MonitoredTicker[]> => {
        const response = await apiClient.get<MonitoredTicker[]>("/monitor/list");
        return response.data;
    },

    /**
     * Add a ticker to the watchlist
     */
    addTicker: async (symbol: string): Promise<void> => {
        const data: AddTickerRequest = { symbol };
        await apiClient.post("/monitor/add", data);
    },

    /**
     * Remove a ticker from the watchlist
     */
    removeTicker: async (symbol: string): Promise<void> => {
        const data: RemoveTickerRequest = { symbol };
        await apiClient.delete("/monitor/remove", { data });
    },

    /**
     * Get analysis history for a specific ticker
     */
    getAnalysisHistory: async (ticker: string, limit = 1): Promise<AnalysisResponse[]> => {
        const response = await apiClient.get<{ reports: AnalysisResponse[] }>(`/analysis/history/${ticker}`, {
            params: { limit },
        });
        return response.data.reports || [];
    },

    /**
     * Run instant analysis for a ticker
     * Uses the TradingAgents multi-agent framework
     */
    runAnalysis: async (ticker: string): Promise<AnalysisResponse> => {
        const response = await apiClient.post<AnalysisResponse>("/analysis/run", { ticker });
        return response.data;
    },
};

