"use client";

import { AlertTriangle, TrendingUp, Info, Check } from "lucide-react";
import type { SentinelAlert } from "@/types/api";
import { formatDistanceToNow } from "date-fns";

interface AlertCardProps {
    alert: SentinelAlert;
    onMarkAsRead: (id: number) => void;
}

export default function AlertCard({ alert, onMarkAsRead }: AlertCardProps) {
    const getAlertIcon = () => {
        switch (alert.alert_type) {
            case "risk_warning":
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case "opportunity":
                return <TrendingUp className="h-5 w-5 text-green-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertColor = () => {
        switch (alert.alert_type) {
            case "risk_warning":
                return "border-red-500/20 bg-red-500/5";
            case "opportunity":
                return "border-green-500/20 bg-green-500/5";
            default:
                return "border-blue-500/20 bg-blue-500/5";
        }
    };

    const getSimilarityColor = () => {
        const score = alert.similarity_score || 0;
        if (score >= 0.7) return "bg-red-500/20 text-red-400";
        if (score >= 0.5) return "bg-yellow-500/20 text-yellow-400";
        return "bg-blue-500/20 text-blue-400";
    };

    const timeAgo = alert.timestamp
        ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })
        : alert.created_at
        ? formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })
        : "Unknown";

    return (
        <div
            className={`rounded-lg border p-4 transition-all ${
                alert.is_read
                    ? "border-white/[0.08] bg-[#121212] opacity-60"
                    : `${getAlertColor()} border`
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5">{getAlertIcon()}</div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">
                                {alert.title || `Alert: ${alert.ticker || "Market"}`}
                            </h3>
                            {alert.ticker && (
                                <span className="text-xs text-gray-500">{alert.ticker}</span>
                            )}
                        </div>

                        {/* Similarity Score Badge */}
                        {alert.similarity_score !== undefined && (
                            <div
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSimilarityColor()}`}
                            >
                                {Math.round(alert.similarity_score * 100)}% match
                            </div>
                        )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {alert.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">{timeAgo}</span>

                        {!alert.is_read && (
                            <button
                                onClick={() => onMarkAsRead(alert.id)}
                                className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <Check className="h-3 w-3" />
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
