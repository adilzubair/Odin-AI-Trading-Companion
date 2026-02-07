import { useCallback, useRef } from "react";
import { observerTracker, debounce } from "@/lib/observer";
import type { ObserverActivityType } from "@/types/api";

/**
 * Hook for tracking user interactions with Observer
 */
export function useObserver() {
    const startTimeRef = useRef<number>(Date.now());

    // Track an event
    const trackEvent = useCallback((activityType: ObserverActivityType, symbol?: string, context?: string) => {
        observerTracker.track({
            activity_type: activityType,
            symbol,
            client_context: context || `User performed ${activityType}`,
        });
    }, []);

    // Track chart view with duration
    const trackChartView = useCallback((symbol: string, timeframe: string) => {
        const duration = Date.now() - startTimeRef.current;
        trackEvent(
            "chart_view",
            symbol,
            `Viewed ${timeframe} chart for ${symbol}, duration: ${Math.round(duration / 1000)}s`
        );
        startTimeRef.current = Date.now(); // Reset timer
    }, [trackEvent]);

    // Track timeframe change
    const trackTimeframeChange = useCallback((symbol: string, from: string, to: string) => {
        trackEvent("timeframe_change", symbol, `Changed from ${from} to ${to}`);
    }, [trackEvent]);

    // Track trade consideration (debounced)
    const trackTradeConsideration = useCallback(
        debounce((symbol: string, side: "buy" | "sell") => {
            trackEvent("trade_consideration", symbol, `Considering ${side} for ${symbol}`);
        }, 2000),
        [trackEvent]
    );

    // Track quantity input (debounced)
    const trackQuantityInput = useCallback(
        debounce((symbol: string, quantity: number) => {
            trackEvent("quantity_input", symbol, `Entered quantity: ${quantity}`);
        }, 1000),
        [trackEvent]
    );

    // Track trade execution
    const trackTradeExecution = useCallback((symbol: string, side: "buy" | "sell", quantity: number, reason: string) => {
        trackEvent(
            "trade_executed",
            symbol,
            `Executed ${side} ${quantity} shares of ${symbol}. Reason: ${reason}`
        );
    }, [trackEvent]);

    // Track stock search
    const trackStockSearch = useCallback((query: string) => {
        trackEvent("stock_search", undefined, `Searched for: ${query}`);
    }, [trackEvent]);

    // Track watchlist add
    const trackWatchlistAdd = useCallback((symbol: string) => {
        trackEvent("watchlist_add", symbol, `Added ${symbol} to watchlist`);
    }, [trackEvent]);

    // Track watchlist remove
    const trackWatchlistRemove = useCallback((symbol: string) => {
        trackEvent("watchlist_remove", symbol, `Removed ${symbol} from watchlist`);
    }, [trackEvent]);

    return {
        trackEvent,
        trackChartView,
        trackTimeframeChange,
        trackTradeConsideration,
        trackQuantityInput,
        trackTradeExecution,
        trackStockSearch,
        trackWatchlistAdd,
        trackWatchlistRemove,
    };
}
