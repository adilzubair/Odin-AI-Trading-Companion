"use client";

import { useTradeStore } from "@/store/useTradeStore";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

export default function PortfolioSummary() {
    const { portfolio } = useTradeStore();

    const isPositive = portfolio.totalReturns >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Cash Balance */}
            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-6 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>Cash Balance</span>
                </div>
                <div className="font-mono-data text-2xl font-semibold text-white">
                    {formatCurrency(portfolio.cashBalance)}
                </div>
            </div>

            {/* Invested Amount */}
            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-6 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Wallet className="h-4 w-4" />
                    <span>Invested Amount</span>
                </div>
                <div className="font-mono-data text-2xl font-semibold text-white">
                    {formatCurrency(portfolio.investedAmount)}
                </div>
            </div>

            {/* Total Account Value */}
            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-6 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Total Value</span>
                </div>
                <div className="font-mono-data text-2xl font-semibold text-white">
                    {formatCurrency(portfolio.currentBalance)}
                </div>
            </div>

            {/* Total Returns */}
            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-6 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span>Total Returns</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={`font-mono-data text-2xl font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {participantSign(portfolio.totalReturns)}{formatCurrency(Math.abs(portfolio.totalReturns))}
                    </span>
                    <span className={`font-mono-data text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        ({participantSign(portfolio.totalReturns)}{Math.abs(portfolio.totalReturnsPercentage).toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}

function participantSign(value: number) {
    return value > 0 ? "+" : value < 0 ? "-" : "";
}
