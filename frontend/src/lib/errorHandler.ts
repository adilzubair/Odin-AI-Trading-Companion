import type { ApiErrorCode } from "@/types/api";
import { getErrorCode, getErrorMessage, isNetworkError, isTimeoutError } from "@/services/api";

/**
 * User-friendly error messages mapped from backend error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
    // Trading errors
    INSUFFICIENT_FUNDS: "You don't have enough cash to execute this trade",
    INVALID_SYMBOL: "This stock symbol doesn't exist",
    INVALID_QUANTITY: "Please enter a valid quantity",
    GUARDRAIL_VIOLATION: "This trade exceeds your risk limits",
    POSITION_NOT_FOUND: "Position not found",

    // Market errors
    MARKET_CLOSED: "The market is currently closed. Trading hours: 9:30 AM - 4:00 PM ET",

    // Authentication errors
    INVALID_API_KEY: "Authentication failed. Please check your API key",

    // Rate limiting
    RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment and try again",

    // Service errors
    SERVICE_UNAVAILABLE: "Trading service is temporarily unavailable. Please try again later",

    // Generic
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again",
};

/**
 * User-friendly error object
 */
export interface UserFriendlyError {
    title: string;
    message: string;
    action?: string;
    details?: Record<string, any>;
}

/**
 * Handle API errors and convert to user-friendly messages
 */
export function handleApiError(error: unknown): UserFriendlyError {
    const errorCode = getErrorCode(error);
    const errorMessage = getErrorMessage(error);

    // Network errors
    if (isNetworkError(error)) {
        return {
            title: "Connection Error",
            message: "Unable to connect to the server. Please check your internet connection",
            action: "Retry",
        };
    }

    // Timeout errors
    if (isTimeoutError(error)) {
        return {
            title: "Request Timeout",
            message: "The request took too long to complete",
            action: "Try again",
        };
    }

    // Known error codes
    if (errorCode && errorCode in ERROR_MESSAGES) {
        const message = ERROR_MESSAGES[errorCode];
        const action = getActionForErrorCode(errorCode);

        return {
            title: getErrorTitle(errorCode),
            message,
            action,
        };
    }

    // Unknown errors
    return {
        title: "Error",
        message: errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR,
        action: "Try again",
    };
}

/**
 * Get error title based on error code
 */
function getErrorTitle(errorCode: string): string {
    const titles: Record<string, string> = {
        INSUFFICIENT_FUNDS: "Insufficient Funds",
        INVALID_SYMBOL: "Invalid Symbol",
        INVALID_QUANTITY: "Invalid Quantity",
        GUARDRAIL_VIOLATION: "Risk Limit Exceeded",
        MARKET_CLOSED: "Market Closed",
        INVALID_API_KEY: "Authentication Failed",
        RATE_LIMIT_EXCEEDED: "Too Many Requests",
        SERVICE_UNAVAILABLE: "Service Unavailable",
        POSITION_NOT_FOUND: "Position Not Found",
    };

    return titles[errorCode] || "Error";
}

/**
 * Get suggested action based on error code
 */
function getActionForErrorCode(errorCode: string): string | undefined {
    const actions: Record<string, string> = {
        INSUFFICIENT_FUNDS: "Add funds or reduce quantity",
        INVALID_SYMBOL: "Check the symbol and try again",
        INVALID_QUANTITY: "Enter a valid quantity",
        GUARDRAIL_VIOLATION: "Reduce trade size or adjust risk settings",
        MARKET_CLOSED: "Try again during market hours",
        INVALID_API_KEY: "Contact support",
        RATE_LIMIT_EXCEEDED: "Wait a moment and try again",
        SERVICE_UNAVAILABLE: "Try again later",
    };

    return actions[errorCode];
}

/**
 * Log error to console (dev) or external service (prod)
 */
export function logError(error: unknown, context?: string): void {
    if (process.env.NODE_ENV === "development") {
        console.error(`[Error${context ? ` - ${context}` : ""}]`, error);
    } else {
        // TODO: Send to external error tracking service (Sentry, etc.)
        console.error(error);
    }
}

/**
 * Check if error is a specific error code
 */
export function isErrorCode(error: unknown, code: ApiErrorCode): boolean {
    return getErrorCode(error) === code;
}
