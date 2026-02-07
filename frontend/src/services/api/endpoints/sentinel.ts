import apiClient from "../client";
import type {
    SentinelAlert,
    MarkReadRequest,
} from "@/types/api";

/**
 * Sentinel Service
 * Handles proactive alerts and warnings
 */
export const sentinelService = {
    /**
     * Get all alerts
     */
    getAlerts: async (): Promise<SentinelAlert[]> => {
        const response = await apiClient.get<SentinelAlert[]>("/sentinel/alerts");
        return response.data;
    },

    /**
     * Mark an alert as read
     */
    markAsRead: async (alertId: number): Promise<void> => {
        await apiClient.post(`/sentinel/alerts/${alertId}/read`);
    },

    /**
     * Get unread alerts count
     */
    getUnreadCount: async (): Promise<number> => {
        const alerts = await sentinelService.getAlerts();
        return alerts.filter((alert) => !alert.is_read).length;
    },
};
