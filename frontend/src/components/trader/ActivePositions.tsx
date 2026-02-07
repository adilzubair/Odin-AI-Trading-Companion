"use client";

import { useTraderStore } from "@/store/useTraderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ActivePositions() {
    const { positions } = useTraderStore();

    if (positions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Active Positions</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p className="text-slate-400">No active positions</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {positions.map((position) => {
                        const isProfit = position.pnl >= 0;
                        const Icon = isProfit ? TrendingUp : TrendingDown;

                        return (
                            <div
                                key={position.ticker}
                                className="rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-white">
                                            {position.ticker}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {formatNumber(position.quantity)} shares
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`flex items-center gap-1 ${isProfit ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="font-semibold">
                                                {formatCurrency(position.pnl)}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-sm font-semibold ${isProfit ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {formatPercentage(position.pnlPercentage)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400">Entry Price</p>
                                        <p className="text-white font-semibold">
                                            {formatCurrency(position.entryPrice)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Current Price</p>
                                        <p className="text-white font-semibold">
                                            {formatCurrency(position.currentPrice)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
