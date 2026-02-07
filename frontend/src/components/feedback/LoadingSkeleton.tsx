interface LoadingSkeletonProps {
    variant?: "card" | "chart" | "list" | "table";
    count?: number;
}

export default function LoadingSkeleton({ variant = "card", count = 1 }: LoadingSkeletonProps) {
    const skeletons = Array.from({ length: count });

    if (variant === "card") {
        return (
            <div className="space-y-3">
                {skeletons.map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border border-white/[0.08] bg-[#121212] p-4 animate-pulse"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-4 w-20 bg-white/10 rounded" />
                            <div className="h-4 w-16 bg-white/10 rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-white/10 rounded" />
                            <div className="h-3 w-3/4 bg-white/10 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "chart") {
        return (
            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-6 animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-6" />
                <div className="h-64 bg-white/5 rounded" />
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div className="space-y-2">
                {skeletons.map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                        <div className="h-10 w-10 bg-white/10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/3 bg-white/10 rounded" />
                            <div className="h-3 w-1/2 bg-white/10 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "table") {
        return (
            <div className="space-y-2">
                {skeletons.map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                        <div className="h-3 w-1/6 bg-white/10 rounded" />
                        <div className="h-3 w-1/6 bg-white/10 rounded" />
                        <div className="h-3 w-1/6 bg-white/10 rounded" />
                        <div className="h-3 w-1/6 bg-white/10 rounded" />
                        <div className="h-3 w-1/6 bg-white/10 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
