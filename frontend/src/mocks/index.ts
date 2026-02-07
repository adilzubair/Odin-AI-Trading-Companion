/**
 * MSW Mock Server Setup
 * 
 * This file initializes the Mock Service Worker to intercept API requests
 * and return mock data during development.
 * 
 * To enable/disable mocking:
 * - Set NEXT_PUBLIC_ENABLE_MOCKING=true in .env.local to enable
 * - Set NEXT_PUBLIC_ENABLE_MOCKING=false to disable and use real backend
 */

export async function initMocks() {
    // Only enable mocking in browser and when flag is set
    if (typeof window === "undefined") {
        return;
    }

    const isMockingEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCKING === "true";

    if (!isMockingEnabled) {
        console.log("[MSW] Mocking disabled - using real backend API");
        return;
    }

    const { worker } = await import("./browser");

    await worker.start({
        onUnhandledRequest: "bypass", // Don't warn about unhandled requests
        serviceWorker: {
            url: "/mockServiceWorker.js",
        },
    });

    console.log("[MSW] Mocking enabled - API requests will be intercepted");
}
