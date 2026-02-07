import { useState, useEffect, useCallback, useRef } from "react";
import { autonomousService } from "@/services/api";
import type { AutonomousStatus, AutonomousConfig, UpdateConfigRequest } from "@/types/api";
import { logError } from "@/lib/errorHandler";

const POLL_INTERVAL_ACTIVE = parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_ACTIVE || "5000");
const POLL_INTERVAL_IDLE = parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_IDLE || "30000");

/**
 * Hook for autonomous trading status with polling
 */
export function useAutonomousStatus() {
    const [status, setStatus] = useState<AutonomousStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            setError(null);
            const data = await autonomousService.getStatus();
            setStatus(data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            logError(error, "useAutonomousStatus.fetchStatus");
        } finally {
            setLoading(false);
        }
    }, []);

    // Set up polling
    useEffect(() => {
        fetchStatus();

        // Poll based on document visibility
        const pollInterval = document.hidden ? POLL_INTERVAL_IDLE : POLL_INTERVAL_ACTIVE;

        intervalRef.current = setInterval(fetchStatus, pollInterval);

        // Handle visibility change
        const handleVisibilityChange = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            const newInterval = document.hidden ? POLL_INTERVAL_IDLE : POLL_INTERVAL_ACTIVE;
            intervalRef.current = setInterval(fetchStatus, newInterval);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchStatus]);

    return { status, loading, error, refetch: fetchStatus };
}

/**
 * Hook for autonomous trading configuration
 */
export function useAutonomousConfig() {
    const [config, setConfig] = useState<AutonomousConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await autonomousService.getConfig();
            setConfig(data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            logError(error, "useAutonomousConfig.fetchConfig");
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConfig = useCallback(
        async (updates: UpdateConfigRequest) => {
            try {
                setUpdating(true);
                setError(null);
                await autonomousService.updateConfig(updates);
                await fetchConfig(); // Refresh
            } catch (err) {
                const error = err as Error;
                setError(error);
                logError(error, "useAutonomousConfig.updateConfig");
                throw error;
            } finally {
                setUpdating(false);
            }
        },
        [fetchConfig]
    );

    const start = useCallback(async () => {
        await updateConfig({ is_autonomous_active: true });
    }, [updateConfig]);

    const stop = useCallback(async () => {
        await updateConfig({ is_autonomous_active: false });
    }, [updateConfig]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return {
        config,
        loading,
        updating,
        error,
        updateConfig,
        start,
        stop,
        refetch: fetchConfig,
    };
}
