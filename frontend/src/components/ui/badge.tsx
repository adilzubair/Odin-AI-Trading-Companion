import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                    {
                        "bg-slate-700/50 text-slate-200": variant === "default",
                        "bg-green-500/20 text-green-400 border border-green-500/30":
                            variant === "success",
                        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30":
                            variant === "warning",
                        "bg-red-500/20 text-red-400 border border-red-500/30":
                            variant === "danger",
                        "bg-blue-500/20 text-blue-400 border border-blue-500/30":
                            variant === "info",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };
