"use client";

import { useTraderStore } from "@/store/useTraderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ActiveSignals() {
    const { signals } = useTraderStore();

    const recentSignals = signals.slice(0, 10);

    if (recentSignals.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Active Signals</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p className="text-slate-400">No signals yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Signals</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {recentSignals.map((signal) => {
                        const getActionIcon = () => {
                            if (signal.action === "buy") return TrendingUp;
                            if (signal.action === "sell") return TrendingDown;
                            return Minus;
                        };

                        const getActionColor = () => {
                            if (signal.action === "buy") return "text-green-400";
                            if (signal.action === "sell") return "text-red-400";
                            return "text-yellow-400";
                        };

                        const Icon = getActionIcon();
                        const color = getActionColor();

                        return (
                            <div
                                key={signal.id}
                                className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${color}`} />
                                        <span className="font-semibold text-white">
                                            {signal.ticker}
                                        </span>
                                        <Badge
                                            variant={signal.action === "buy" ? "success" : signal.action === "sell" ? "danger" : "warning"}
                                        >
                                            {signal.action.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <Badge variant={signal.source === "mahoraga" ? "info" : "default"}>
                                        {signal.source === "mahoraga" ? "MAHORAGA" : "TAURIC"}
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-300 mb-2">{signal.reason}</p>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Confidence</span>
                                    <span className={`font-semibold ${color}`}>
                                        {signal.confidence}%
                                    </span>
                                </div>
                                <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden mt-1">
                                    <div
                                        className={`h-full transition-all duration-500 ${signal.action === "buy"
                                                ? "bg-gradient-to-r from-green-500 to-green-400"
                                                : signal.action === "sell"
                                                    ? "bg-gradient-to-r from-red-500 to-red-400"
                                                    : "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                            }`}
                                        style={{ width: `${signal.confidence}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
