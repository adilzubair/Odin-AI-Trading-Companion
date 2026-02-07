"use client";

import { useTraderStore } from "@/store/useTraderStore";
import { formatCurrency, formatPercentage, formatTimestamp } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Activity, Brain, Play, Square } from "lucide-react";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

export default function TraderTab() {
    const { portfolio, positions, signals, activityFeed, llmCosts, isTrading, setIsTrading } = useTraderStore();

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a] p-6">
            <div className="space-y-6">
                {/* Header with Start/Stop */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-gray-400">
                        Trading Dashboard
                    </h2>
                    <button
                        onClick={() => setIsTrading(!isTrading)}
                        className={`group flex items-center gap-2 rounded px-4 py-1.5 text-xs font-medium transition-all ${isTrading
                            ? "bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-500"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {isTrading ? (
                            <>
                                <Square className="h-3 w-3 group-hover:hidden" />
                                <Square className="h-3 w-3 hidden group-hover:block" />
                                <span className="group-hover:hidden">RUNNING</span>
                                <span className="hidden group-hover:block">STOP</span>
                            </>
                        ) : (
                            <>
                                <Play className="h-3 w-3" />
                                START
                            </>
                        )}
                    </button>
                </div>

                {/* Portfolio Stats */}
                <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-4">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Balance & Total Value */}
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Balance</p>
                            <p className="font-mono-data text-lg font-semibold text-white">
                                {formatCurrency(portfolio.balance)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Total Value</p>
                            <p className="font-mono-data text-lg font-semibold text-white">
                                {formatCurrency(portfolio.totalValue)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Total P&L</p>
                            <p className={`font-mono-data text-lg font-semibold ${portfolio.totalPnL >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {formatCurrency(portfolio.totalPnL)}
                            </p>
                            <p className={`text-xs font-medium ${portfolio.totalPnL >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {formatPercentage(portfolio.totalPnLPercentage)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-6">
                        {/* Unrealized & Realized P&L */}
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Unrealized P&L</p>
                            <p className={`font-mono-data text-sm font-medium ${portfolio.unrealizedPnL >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {formatCurrency(portfolio.unrealizedPnL)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Realized P&L</p>
                            <p className={`font-mono-data text-sm font-medium ${portfolio.realizedPnL >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {formatCurrency(portfolio.realizedPnL)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Day P&L</p>
                            <p className={`font-mono-data text-sm font-medium ${portfolio.dayPnL >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {formatCurrency(portfolio.dayPnL)}
                            </p>
                            <p className={`text-xs font-medium ${portfolio.dayPnL >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {formatPercentage(portfolio.dayPnLPercentage)}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Performance Charts */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 rounded-lg border border-white/[0.08] bg-[#121212] p-4">
                        <h3 className="mb-4 text-xs font-medium text-gray-400">
                            Portfolio Performance
                        </h3>
                        <div className="h-64">
                            <PerformanceChart type="portfolio" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-4">
                        <h3 className="mb-4 text-xs font-medium text-gray-400">
                            Position Performance
                        </h3>
                        <div className="h-64">
                            <PerformanceChart type="positions" />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Positions */}
                    <div className="col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-400">
                                Active Positions
                            </h2>
                            <span className="font-mono-data text-xs text-gray-600">
                                {positions.length} OPEN
                            </span>
                        </div>

                        {positions.length === 0 ? (
                            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-12 text-center">
                                <p className="text-sm text-gray-600">No active positions</p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-white/[0.08] bg-[#121212] divide-y divide-white/[0.08]">
                                {positions.map((position, index) => {
                                    const isProfit = position.pnl >= 0;
                                    return (
                                        <div key={`${position.ticker}-${index}`} className="p-4">
                                            <div className="grid grid-cols-5 gap-4 items-center">
                                                <div>
                                                    <p className="font-mono-data text-sm font-semibold text-white">
                                                        {position.ticker}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {position.quantity} shares
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-600">Entry</p>
                                                    <p className="font-mono-data text-sm text-gray-300">
                                                        {formatCurrency(position.entryPrice)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-600">Current</p>
                                                    <p className="font-mono-data text-sm text-gray-300">
                                                        {formatCurrency(position.currentPrice)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-600">P&L</p>
                                                    <p className={`font-mono-data text-sm font-semibold ${isProfit ? "text-green-500" : "text-red-500"
                                                        }`}>
                                                        {formatCurrency(position.pnl)}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`font-mono-data text-sm font-medium ${isProfit ? "text-green-500" : "text-red-500"
                                                        }`}>
                                                        {formatPercentage(position.pnlPercentage)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Active Signals */}
                        <div className="mt-6">
                            <h2 className="mb-4 text-sm font-medium text-gray-400">
                                Active Signals
                            </h2>

                            {signals.length === 0 ? (
                                <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-12 text-center">
                                    <p className="text-sm text-gray-600">No signals yet</p>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-white/[0.08] bg-[#121212] divide-y divide-white/[0.08]">
                                    {signals.slice(0, 5).map((signal) => {
                                        const actionColor =
                                            signal.action === "buy"
                                                ? "text-green-500"
                                                : signal.action === "sell"
                                                    ? "text-red-500"
                                                    : "text-gray-400";

                                        return (
                                            <div key={signal.id} className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono-data text-sm font-semibold text-white">
                                                            {signal.ticker}
                                                        </span>
                                                        <span className={`text-xs font-semibold uppercase ${actionColor}`}>
                                                            {signal.action}
                                                        </span>
                                                        <span className="text-xs text-gray-600 uppercase">
                                                            {signal.category}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono-data text-xs text-gray-600">
                                                        {signal.confidence}%
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">{signal.reason}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* LLM Costs */}
                        <div>
                            <h2 className="mb-4 text-sm font-medium text-gray-400">
                                LLM Usage
                            </h2>
                            <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-4 space-y-3">
                                {/* Total Spend & API Calls */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Total Spend</p>
                                        <p className="font-mono-data text-sm font-medium text-white">
                                            {formatCurrency(llmCosts.totalSpend)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">API Calls</p>
                                        <p className="font-mono-data text-sm font-medium text-white">
                                            {llmCosts.totalApiCalls.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Tokens In & Tokens Out */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Tokens In</p>
                                        <p className="font-mono-data text-sm font-medium text-gray-400">
                                            {llmCosts.tokensIn.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Tokens Out</p>
                                        <p className="font-mono-data text-sm font-medium text-gray-400">
                                            {llmCosts.tokensOut.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Model */}
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Model</p>
                                    <p className="font-mono-data text-sm font-medium text-white">
                                        {llmCosts.model}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div>
                            <h2 className="mb-4 text-sm font-medium text-gray-400">
                                Activity Feed
                            </h2>
                            <div className="rounded-lg border border-white/[0.08] bg-[#121212] max-h-96 overflow-y-auto custom-scrollbar">
                                {activityFeed.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-xs text-gray-600">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/[0.08]">
                                        {activityFeed.slice(0, 10).map((activity) => {
                                            const Icon =
                                                activity.type === "trade"
                                                    ? DollarSign
                                                    : activity.type === "signal"
                                                        ? Activity
                                                        : Brain;

                                            const iconColor =
                                                activity.type === "trade"
                                                    ? "text-green-500"
                                                    : activity.type === "signal"
                                                        ? "text-gray-400"
                                                        : "text-gray-500";

                                            return (
                                                <div key={activity.id} className="p-3">
                                                    <div className="flex items-start gap-3">
                                                        <Icon className={`h-3.5 w-3.5 mt-0.5 ${iconColor}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-300">{activity.message}</p>
                                                            <p className="mt-1 font-mono-data text-xs text-gray-600">
                                                                {formatTimestamp(activity.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
