import type {
    StockQuote,
    HistoricalData,
    BatchQuotesRequest,
    BatchQuotesResponse,
} from "@/types/api";
import { apiClient } from "../client";

/**
 * Market Data Service
 * Connects to backend API for real-time market data from Alpaca
 */
export const marketService = {
    /**
     * Get real-time quote for a symbol
     * Returns bid/ask format from Alpaca API
     */
    getQuote: async (symbol: string): Promise<StockQuote> => {
        const response = await apiClient.get<StockQuote>(`/market/quote/${symbol}`);
        return response.data;
    },

    /**
     * Get historical price data
     */
    getHistory: async (
        symbol: string,
        timeframe: string = "1D",
        interval?: string
    ): Promise<HistoricalData> => {
        const params: Record<string, string> = { timeframe };
        if (interval) {
            params.interval = interval;
        }

        const response = await apiClient.get<HistoricalData>(
            `/market/history/${symbol}`,
            { params }
        );
        return response.data;
    },

    /**
     * Get quotes for multiple symbols
     * Falls back to individual requests if batch endpoint not available
     */
    getBatchQuotes: async (symbols: string[]): Promise<BatchQuotesResponse> => {
        // Try batch endpoint first, fall back to individual requests
        try {
            const response = await apiClient.post<BatchQuotesResponse>(
                "/market/quotes",
                { symbols }
            );
            return response.data;
        } catch (error) {
            // Fallback: fetch quotes individually
            const quotes = await Promise.all(
                symbols.map((symbol) =>
                    marketService.getQuote(symbol).catch(() => null)
                )
            );

            return {
                quotes: quotes.filter((q): q is StockQuote => q !== null),
                timestamp: new Date().toISOString(),
            };
        }
    },
};

