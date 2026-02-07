import { useState, useEffect, useCallback, useRef } from "react";
import { sentinelService } from "@/services/api";
import type { SentinelAlert } from "@/types/api";
import { logError } from "@/lib/errorHandler";

const POLL_INTERVAL_ACTIVE = parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_ACTIVE || "5000");
const POLL_INTERVAL_IDLE = parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_IDLE || "30000");

/**
 * Hook for Sentinel alerts with polling
 */
export function useSentinelAlerts() {
    const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            setError(null);
            const data = await sentinelService.getAlerts();
            setAlerts(data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            logError(error, "useSentinelAlerts.fetchAlerts");
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(
        async (alertId: number) => {
            try {
                await sentinelService.markAsRead(alertId);
                // Update local state optimistically
                setAlerts((prev) =>
                    prev.map((alert) => (alert.id === alertId ? { ...alert, is_read: true } : alert))
                );
            } catch (err) {
                const error = err as Error;
                logError(error, "useSentinelAlerts.markAsRead");
                // Refetch to get correct state
                await fetchAlerts();
                throw error;
            }
        },
        [fetchAlerts]
    );

    // Set up polling
    useEffect(() => {
        fetchAlerts();

        // Poll based on document visibility
        const pollInterval = document.hidden ? POLL_INTERVAL_IDLE : POLL_INTERVAL_ACTIVE;

        intervalRef.current = setInterval(fetchAlerts, pollInterval);

        // Handle visibility change
        const handleVisibilityChange = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            const newInterval = document.hidden ? POLL_INTERVAL_IDLE : POLL_INTERVAL_ACTIVE;
            intervalRef.current = setInterval(fetchAlerts, newInterval);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchAlerts]);

    // Computed values
    const unreadCount = alerts.filter((alert) => !alert.is_read).length;
    const unreadAlerts = alerts.filter((alert) => !alert.is_read);

    return {
        alerts,
        unreadAlerts,
        unreadCount,
        loading,
        error,
        markAsRead,
        refetch: fetchAlerts,
    };
}
