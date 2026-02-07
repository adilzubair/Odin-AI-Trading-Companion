import { useState, useEffect, useCallback, useRef } from "react";
import { positionsService } from "@/services/api";
import type { BackendPosition } from "@/types/api";
import { logError } from "@/lib/errorHandler";

const POLL_INTERVAL_ACTIVE = parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_ACTIVE || "5000");
const POLL_INTERVAL_IDLE = parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_IDLE || "30000");

/**
 * Hook for fetching positions with polling
 */
export function usePositions(status: "open" | "closed" | "all" = "open") {
    const [positions, setPositions] = useState<BackendPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchPositions = useCallback(async () => {
        try {
            setError(null);
            const data = await positionsService.getPositions(status);
            setPositions(data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            logError(error, "usePositions.fetchPositions");
        } finally {
            setLoading(false);
        }
    }, [status]);

    // Set up polling
    useEffect(() => {
        fetchPositions();

        // Poll based on document visibility
        const pollInterval = document.hidden ? POLL_INTERVAL_IDLE : POLL_INTERVAL_ACTIVE;

        intervalRef.current = setInterval(fetchPositions, pollInterval);

        // Handle visibility change
        const handleVisibilityChange = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            const newInterval = document.hidden ? POLL_INTERVAL_IDLE : POLL_INTERVAL_ACTIVE;
            intervalRef.current = setInterval(fetchPositions, newInterval);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchPositions]);

    return { positions, loading, error, refetch: fetchPositions };
}
