import apiClient from "../client";
import type { BackendPosition } from "@/types/api";

/**
 * Positions Service
 * Handles position data retrieval
 */
export const positionsService = {
    /**
     * Get all positions
     */
    getPositions: async (status: "open" | "closed" | "all" = "open"): Promise<BackendPosition[]> => {
        const response = await apiClient.get<BackendPosition[]>("/positions", {
            params: { status },
        });
        return response.data;
    },
};
