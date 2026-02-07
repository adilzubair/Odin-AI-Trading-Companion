"use client";

import { useTraderStore } from "@/store/useTraderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/utils";
import { Activity, TrendingUp, Brain } from "lucide-react";

export function ActivityFeed() {
    const { activityFeed } = useTraderStore();

    const recentActivity = activityFeed.slice(0, 20);

    if (recentActivity.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Feed</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p className="text-slate-400">No activity yet</p>
                </CardContent>
            </Card>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "trade":
                return TrendingUp;
            case "signal":
                return Activity;
            case "analysis":
                return Brain;
            default:
                return Activity;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case "trade":
                return "text-green-400";
            case "signal":
                return "text-blue-400";
            case "analysis":
                return "text-purple-400";
            default:
                return "text-slate-400";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {recentActivity.map((activity) => {
                        const Icon = getIcon(activity.type);
                        const iconColor = getIconColor(activity.type);

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                            >
                                <Icon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">{activity.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formatTimestamp(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
