import apiClient from "../client";
import type {
    AutonomousStatus,
    AutonomousConfig,
    UpdateConfigRequest,
} from "@/types/api";

/**
 * Autonomous Trading Service
 * Handles auto-pilot status and configuration
 */
export const autonomousService = {
    /**
     * Get current autonomous trading status
     */
    getStatus: async (): Promise<AutonomousStatus> => {
        const response = await apiClient.get<AutonomousStatus>("/autonomous/status");
        return response.data;
    },

    /**
     * Get autonomous trading configuration
     */
    getConfig: async (): Promise<AutonomousConfig> => {
        const response = await apiClient.get<AutonomousConfig>("/autonomous/config");
        return response.data;
    },

    /**
     * Update autonomous trading configuration
     */
    updateConfig: async (config: UpdateConfigRequest): Promise<void> => {
        await apiClient.post("/autonomous/config", config);
    },

    /**
     * Start autonomous trading
     */
    start: async (): Promise<void> => {
        await autonomousService.updateConfig({ is_autonomous_active: true });
    },

    /**
     * Stop autonomous trading
     */
    stop: async (): Promise<void> => {
        await autonomousService.updateConfig({ is_autonomous_active: false });
    },
};
