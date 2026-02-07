import { useState, useEffect, useCallback } from "react";
import { monitorService } from "@/services/api";
import type { MonitoredTicker, AnalysisResponse } from "@/types/api";
import { handleApiError, logError } from "@/lib/errorHandler";

const DAILY_LIMIT = 3;
const STORAGE_KEY = "instant_analysis_usage";

interface DailyUsage {
    date: string;
    count: number;
}

function getTodayUsage(): DailyUsage {
    const today = new Date().toISOString().split("T")[0];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const usage = JSON.parse(stored) as DailyUsage;
            if (usage.date === today) {
                return usage;
            }
        }
    } catch {
        // Ignore parse errors
    }
    return { date: today, count: 0 };
}

function incrementUsage(): DailyUsage {
    const usage = getTodayUsage();
    usage.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    return usage;
}

/**
 * Hook for managing watchlist and analysis reports
 */
export function useMonitor() {
    const [watchlist, setWatchlist] = useState<MonitoredTicker[]>([]);
    const [analysisReports, setAnalysisReports] = useState<Map<string, AnalysisResponse>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [analyzingSymbol, setAnalyzingSymbol] = useState<string | null>(null);
    const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: "", count: 0 });

    // Initialize daily usage from localStorage
    useEffect(() => {
        setDailyUsage(getTodayUsage());
    }, []);

    // Fetch watchlist
    const fetchWatchlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await monitorService.getWatchlist();
            setWatchlist(data);

            // Fetch analysis reports for each ticker
            const reports = new Map<string, AnalysisResponse>();
            await Promise.all(
                data.map(async (ticker) => {
                    try {
                        const history = await monitorService.getAnalysisHistory(ticker.symbol, 1);
                        if (history.length > 0) {
                            reports.set(ticker.symbol, history[0]);
                        }
                    } catch (err) {
                        console.error(`Failed to fetch analysis for ${ticker.symbol}:`, err);
                    }
                })
            );
            setAnalysisReports(reports);
        } catch (err) {
            const error = err as Error;
            setError(error);
            logError(error, "useMonitor.fetchWatchlist");
        } finally {
            setLoading(false);
        }
    }, []);

    // Add ticker to watchlist
    const addTicker = useCallback(
        async (symbol: string) => {
            try {
                await monitorService.addTicker(symbol);
                await fetchWatchlist(); // Refresh
            } catch (err) {
                const error = err as Error;
                logError(error, "useMonitor.addTicker");
                throw error; // Re-throw so caller can handle
            }
        },
        [fetchWatchlist]
    );

    // Remove ticker from watchlist
    const removeTicker = useCallback(
        async (symbol: string) => {
            try {
                await monitorService.removeTicker(symbol);
                await fetchWatchlist(); // Refresh
            } catch (err) {
                const error = err as Error;
                logError(error, "useMonitor.removeTicker");
                throw error;
            }
        },
        [fetchWatchlist]
    );

    // Run instant analysis (with daily limit)
    const runInstantAnalysis = useCallback(
        async (symbol: string): Promise<AnalysisResponse | null> => {
            const usage = getTodayUsage();
            if (usage.count >= DAILY_LIMIT) {
                throw new Error(`Daily limit reached (${DAILY_LIMIT} analyses per day)`);
            }

            try {
                setAnalyzingSymbol(symbol);
                const result = await monitorService.runAnalysis(symbol);

                // Update usage
                const newUsage = incrementUsage();
                setDailyUsage(newUsage);

                // Update the reports map with new result
                setAnalysisReports((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(symbol, result);
                    return newMap;
                });

                return result;
            } catch (err) {
                const error = err as Error;
                logError(error, "useMonitor.runInstantAnalysis");
                throw error;
            } finally {
                setAnalyzingSymbol(null);
            }
        },
        []
    );

    // Initial fetch
    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    return {
        watchlist,
        analysisReports,
        loading,
        error,
        addTicker,
        removeTicker,
        refetch: fetchWatchlist,
        runInstantAnalysis,
        analyzingSymbol,
        dailyUsage,
        dailyLimit: DAILY_LIMIT,
        remainingAnalyses: Math.max(0, DAILY_LIMIT - dailyUsage.count),
    };
}

