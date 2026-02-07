"use client";

import { useTraderStore } from "@/store/useTraderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";

export function PortfolioOverview() {
    const { portfolio } = useTraderStore();

    const stats = [
        {
            label: "Total Balance",
            value: formatCurrency(portfolio.balance),
            icon: Wallet,
            color: "text-blue-400",
        },
        {
            label: "Total Value",
            value: formatCurrency(portfolio.totalValue),
            icon: DollarSign,
            color: "text-green-400",
        },
        {
            label: "Total P&L",
            value: formatCurrency(portfolio.totalPnL),
            percentage: formatPercentage(portfolio.totalPnLPercentage),
            icon: portfolio.totalPnL >= 0 ? TrendingUp : TrendingDown,
            color: portfolio.totalPnL >= 0 ? "text-green-400" : "text-red-400",
        },
        {
            label: "Day P&L",
            value: formatCurrency(portfolio.dayPnL),
            percentage: formatPercentage(portfolio.dayPnLPercentage),
            icon: portfolio.dayPnL >= 0 ? TrendingUp : TrendingDown,
            color: portfolio.dayPnL >= 0 ? "text-green-400" : "text-red-400",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.label} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </p>
                                {stat.percentage && (
                                    <p className={`text-sm font-semibold ${stat.color}`}>
                                        {stat.percentage}
                                    </p>
                                )}
                            </div>
                            <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
