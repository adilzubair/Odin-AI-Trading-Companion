"use client";

import { useEffect, useState } from "react";

/**
 * MSW Provider Component
 * Initializes Mock Service Worker when mocking is enabled
 */
export function MSWProvider({ children }: { children: React.ReactNode }) {
    const [mswReady, setMswReady] = useState(false);

    useEffect(() => {
        async function init() {
            if (process.env.NEXT_PUBLIC_ENABLE_MOCKING === "true") {
                const { initMocks } = await import("@/mocks");
                await initMocks();
            }
            setMswReady(true);
        }

        init();
    }, []);

    // Don't render children until MSW is ready (if enabled)
    // This prevents API calls from being made before MSW is initialized
    if (process.env.NEXT_PUBLIC_ENABLE_MOCKING === "true" && !mswReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white text-sm">Initializing...</div>
            </div>
        );
    }

    return <>{children}</>;
}
