import apiClient from "../client";
import type {
    ObserverEvent,
    LogActionRequest,
} from "@/types/api";

/**
 * Observer Service
 * Handles user activity logging for behavioral learning
 */
export const observerService = {
    /**
     * Log a single user action
     */
    logAction: async (event: LogActionRequest): Promise<void> => {
        await apiClient.post("/observer/log", event);
    },

    /**
     * Log multiple actions in batch
     */
    logBatch: async (events: ObserverEvent[]): Promise<void> => {
        // Transform events to match API format
        const requests: LogActionRequest[] = events.map((event) => ({
            activity_type: event.activity_type,
            symbol: event.symbol,
            client_context: event.client_context,
        }));

        // Send all events (backend should handle batch, or we send individually)
        await Promise.all(requests.map((req) => observerService.logAction(req)));
    },
};
