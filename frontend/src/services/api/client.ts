import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import type { ErrorResponse } from "@/types/api";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "dev_secret_key";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 30000; // 30 seconds

/**
 * Create Axios instance with base configuration
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
    },
});

/**
 * Request interceptor
 * - Adds authentication headers
 * - Logs requests in development
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Log request in development
        if (process.env.NODE_ENV === "development") {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        console.error("[API Request Error]", error);
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * - Handles errors
 * - Implements retry logic
 * - Logs responses in development
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === "development") {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error: AxiosError<ErrorResponse>) => {
        const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

        // Log error in development
        if (process.env.NODE_ENV === "development") {
            console.error("[API Response Error]", {
                url: config?.url,
                status: error.response?.status,
                error: error.response?.data,
            });
        }

        // Don't retry if no config or if it's a client error (4xx)
        if (!config || (error.response && error.response.status >= 400 && error.response.status < 500)) {
            return Promise.reject(error);
        }

        // Initialize retry count
        config._retryCount = config._retryCount || 0;

        // Check if we've exceeded max retries
        if (config._retryCount >= MAX_RETRIES) {
            console.error(`[API] Max retries (${MAX_RETRIES}) exceeded for ${config.url}`);
            return Promise.reject(error);
        }

        // Increment retry count
        config._retryCount += 1;

        // Calculate delay with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1);

        console.log(`[API] Retrying request (${config._retryCount}/${MAX_RETRIES}) after ${delay}ms: ${config.url}`);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        return apiClient(config);
    }
);

/**
 * Helper function to extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ErrorResponse | undefined;
        if (apiError?.error?.message) {
            return apiError.error.message;
        }
        if (error.message) {
            return error.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "An unknown error occurred";
}

/**
 * Helper function to extract error code from API error
 */
export function getErrorCode(error: unknown): string | null {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ErrorResponse | undefined;
        if (apiError?.error?.code) {
            return apiError.error.code;
        }
    }
    return null;
}

/**
 * Helper function to check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
        return !error.response && error.code !== "ECONNABORTED";
    }
    return false;
}

/**
 * Helper function to check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
        return error.code === "ECONNABORTED" || error.message.includes("timeout");
    }
    return false;
}

export default apiClient;
