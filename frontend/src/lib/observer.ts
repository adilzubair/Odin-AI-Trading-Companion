import { observerService } from "@/services/api";
import type { ObserverEvent } from "@/types/api";

/**
 * Observer Tracker Class
 * Batches and sends user activity events to the backend
 */
class ObserverTracker {
    private events: ObserverEvent[] = [];
    private batchInterval: NodeJS.Timeout | null = null;
    private readonly BATCH_DELAY = 10000; // 10 seconds
    private readonly MAX_BATCH_SIZE = 50;
    private isEnabled: boolean;

    constructor() {
        // Check if Observer is enabled via feature flag
        this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_OBSERVER === "true";

        // Flush events on page unload
        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => {
                this.flush();
            });
        }
    }

    /**
     * Track a user event
     */
    track(event: Omit<ObserverEvent, "timestamp">): void {
        if (!this.isEnabled) {
            return;
        }

        // Add timestamp
        const eventWithTimestamp: ObserverEvent = {
            ...event,
            timestamp: Date.now(),
        };

        this.events.push(eventWithTimestamp);

        // Start batch timer if not already running
        if (!this.batchInterval) {
            this.batchInterval = setInterval(() => {
                this.flush();
            }, this.BATCH_DELAY);
        }

        // Flush immediately if batch is full
        if (this.events.length >= this.MAX_BATCH_SIZE) {
            this.flush();
        }
    }

    /**
     * Flush all pending events to the backend
     */
    async flush(): Promise<void> {
        if (this.events.length === 0) {
            return;
        }

        const batch = [...this.events];
        this.events = [];

        try {
            await observerService.logBatch(batch);

            if (process.env.NODE_ENV === "development") {
                console.log(`[Observer] Flushed ${batch.length} events`);
            }
        } catch (error) {
            // Re-add events if failed (with limit to prevent infinite growth)
            if (this.events.length < this.MAX_BATCH_SIZE * 2) {
                this.events.unshift(...batch);
            }

            console.error("[Observer] Failed to flush events:", error);
        }
    }

    /**
     * Stop the batch timer
     */
    stop(): void {
        if (this.batchInterval) {
            clearInterval(this.batchInterval);
            this.batchInterval = null;
        }
    }

    /**
     * Enable or disable tracking
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stop();
            this.events = [];
        }
    }
}

// Global singleton instance
export const observerTracker = new ObserverTracker();

/**
 * Debounce helper for frequent events
 */
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);
    };
}
