"use client";

import { useState } from "react";
import { Bell, AlertTriangle, TrendingUp, Info, History } from "lucide-react";
import { useSentinelAlerts } from "@/hooks/api/useSentinel";
import AlertCard from "@/components/alerts/AlertCard";
import type { SentinelAlert } from "@/types/api";

type FilterType = "all" | "unread" | "history" | "risk_warning" | "opportunity" | "info";

export default function AlertsTab() {
    const { alerts, unreadCount, loading, error, markAsRead } = useSentinelAlerts();
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredAlerts = alerts.filter((alert) => {
        if (filter === "all") return true;
        if (filter === "unread") return !alert.is_read;
        if (filter === "history") return alert.is_read;
        return alert.alert_type === filter;
    });

    const getFilterCount = (type: FilterType) => {
        if (type === "all") return alerts.length;
        if (type === "unread") return unreadCount;
        if (type === "history") return alerts.filter((a) => a.is_read).length;
        return alerts.filter((a) => a.alert_type === type).length;
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-6 w-6 text-white" />
                        <h2 className="text-2xl font-semibold text-white">Alerts</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        {unreadCount > 0 ? (
                            <>
                                <span className="text-white font-medium">{unreadCount}</span> unread •{" "}
                            </>
                        ) : (
                            "No unread alerts • "
                        )}
                        <span className="text-gray-500">{alerts.length} total</span>
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-white/[0.08] pb-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "all"
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        All ({getFilterCount("all")})
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "unread"
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        Unread ({getFilterCount("unread")})
                    </button>
                    <button
                        onClick={() => setFilter("history")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "history"
                                ? "bg-purple-500/10 text-purple-400"
                                : "text-gray-400 hover:text-purple-400 hover:bg-purple-500/5"
                        }`}
                    >
                        <History className="h-3.5 w-3.5" />
                        History ({getFilterCount("history")})
                    </button>
                    <button
                        onClick={() => setFilter("risk_warning")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "risk_warning"
                                ? "bg-red-500/10 text-red-400"
                                : "text-gray-400 hover:text-red-400 hover:bg-red-500/5"
                        }`}
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Risks ({getFilterCount("risk_warning")})
                    </button>
                    <button
                        onClick={() => setFilter("opportunity")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "opportunity"
                                ? "bg-green-500/10 text-green-400"
                                : "text-gray-400 hover:text-green-400 hover:bg-green-500/5"
                        }`}
                    >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Opportunities ({getFilterCount("opportunity")})
                    </button>
                    <button
                        onClick={() => setFilter("info")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "info"
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/5"
                        }`}
                    >
                        <Info className="h-3.5 w-3.5" />
                        Info ({getFilterCount("info")})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-400">Loading alerts...</div>
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-sm text-red-400">Failed to load alerts: {error.message}</p>
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Bell className="h-12 w-12 text-gray-600" />
                        <p className="text-gray-400">
                            {filter === "all"
                                ? "No alerts yet"
                                : filter === "unread"
                                ? "No unread alerts"
                                : filter === "history"
                                ? "No past alerts"
                                : `No ${filter.replace("_", " ")} alerts`}
                        </p>
                        <p className="text-sm text-gray-500">
                            {filter === "history"
                                ? "Alerts you've marked as read will appear here"
                                : "Sentinel will notify you when similar market patterns are detected"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} onMarkAsRead={markAsRead} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
