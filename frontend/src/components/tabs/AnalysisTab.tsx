"use client";

import { useState } from "react";
import { useMonitor } from "@/hooks/api/useMonitor";
import { useObserver } from "@/hooks/api/useObserver";
import { Search, X, Plus, Brain, TrendingUp, TrendingDown, Minus, Clock, Zap, Loader2 } from "lucide-react";
import type { Ticker } from "@/types";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import EmptyState from "@/components/feedback/EmptyState";
import RetryButton from "@/components/feedback/RetryButton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

const POPULAR_STOCKS: Ticker[] = [
    { symbol: "AAPL", type: "stock", name: "Apple Inc." },
    { symbol: "NVDA", type: "stock", name: "NVIDIA Corporation" },
    { symbol: "MSFT", type: "stock", name: "Microsoft Corporation" },
    { symbol: "GOOGL", type: "stock", name: "Alphabet Inc." },
    { symbol: "TSLA", type: "stock", name: "Tesla, Inc." },
    { symbol: "AMZN", type: "stock", name: "Amazon.com Inc." },
];

const POPULAR_CRYPTO: Ticker[] = [
    { symbol: "BTC", type: "crypto", name: "Bitcoin" },
    { symbol: "ETH", type: "crypto", name: "Ethereum" },
    { symbol: "SOL", type: "crypto", name: "Solana" },
];

export default function AnalysisTab() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeAssetType, setActiveAssetType] = useState<"stocks" | "crypto">("stocks");
    const { 
        watchlist, 
        analysisReports, 
        loading, 
        error, 
        addTicker, 
        removeTicker, 
        refetch,
        runInstantAnalysis,
        analyzingSymbol,
        remainingAnalyses,
        dailyLimit,
    } = useMonitor();
    const { trackWatchlistAdd, trackWatchlistRemove } = useObserver();

    const availableTickers = activeAssetType === "stocks" ? POPULAR_STOCKS : POPULAR_CRYPTO;
    const filteredTickers = availableTickers.filter(
        (ticker) =>
            ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticker.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddTicker = async (ticker: Ticker) => {
        try {
            await addTicker(ticker.symbol);
            trackWatchlistAdd(ticker.symbol);
            toast.success(`Added ${ticker.symbol} to watchlist`);
        } catch (err) {
            toast.error(`Failed to add ${ticker.symbol} to watchlist`);
        }
    };

    const handleRemoveTicker = async (symbol: string) => {
        try {
            await removeTicker(symbol);
            trackWatchlistRemove(symbol);
            toast.success(`Removed ${symbol} from watchlist`);
        } catch (err) {
            toast.error(`Failed to remove ${symbol} from watchlist`);
        }
    };

    const handleRunAnalysis = async (symbol: string) => {
        if (remainingAnalyses <= 0) {
            toast.error(`Daily limit reached (${dailyLimit} analyses per day)`);
            return;
        }
        
        try {
            toast.info(`Running AI analysis for ${symbol}... This may take a moment.`);
            await runInstantAnalysis(symbol);
            toast.success(`Analysis complete for ${symbol}!`);
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || `Failed to run analysis for ${symbol}`);
        }
    };

    return (
        <div className="grid h-full grid-cols-[280px_1fr] gap-0">
            {/* Left Sidebar - Watchlist Management */}
            <div className="border-r border-white/[0.08] bg-[#0a0a0a] p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-medium text-gray-400">
                            Watchlist
                        </h2>
                        <span className="font-mono-data text-xs text-gray-600">
                            {watchlist.length}/10
                        </span>
                    </div>

                    {/* Asset Type Tabs */}
                    <div className="flex gap-1 rounded-md bg-[#121212] p-1">
                        <button
                            onClick={() => setActiveAssetType("stocks")}
                            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-all ${activeAssetType === "stocks"
                                ? "bg-white/10 text-white"
                                : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            Stocks
                        </button>
                        <button
                            onClick={() => setActiveAssetType("crypto")}
                            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-all ${activeAssetType === "crypto"
                                ? "bg-white/10 text-white"
                                : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            Crypto
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-md border border-white/[0.08] bg-[#121212] py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-white/20 focus:outline-none"
                        />
                    </div>

                    {/* Watchlist Tickers */}
                    {watchlist.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-600">IN WATCHLIST</p>
                            <div className="space-y-1">
                                {watchlist.map((ticker) => (
                                    <div
                                        key={ticker.id}
                                        className="flex items-center justify-between rounded-md border border-white/[0.08] bg-[#121212] px-3 py-2"
                                    >
                                        <div>
                                            <p className="font-mono-data text-sm font-semibold text-white">
                                                {ticker.symbol}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {ticker.is_active ? "Active" : "Inactive"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveTicker(ticker.symbol)}
                                            className="text-gray-600 hover:text-red-500 transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Available Tickers */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">AVAILABLE</p>
                        <div className="space-y-1">
                            {filteredTickers.map((ticker) => {
                                const isInWatchlist = watchlist.some((t) => t.symbol === ticker.symbol);
                                const canAdd = watchlist.length < 10;

                                return (
                                    <button
                                        key={ticker.symbol}
                                        onClick={() => {
                                            if (!isInWatchlist && canAdd) handleAddTicker(ticker);
                                        }}
                                        disabled={isInWatchlist || !canAdd}
                                        className={`w-full rounded-md px-3 py-2 text-left transition-all flex items-center justify-between ${isInWatchlist
                                            ? "opacity-40 cursor-not-allowed"
                                            : canAdd
                                                ? "border border-white/[0.08] bg-[#121212] hover:border-white/20 hover:bg-white/5"
                                                : "opacity-30 cursor-not-allowed"
                                            }`}
                                    >
                                        <div>
                                            <p className="font-mono-data text-sm font-semibold text-white">
                                                {ticker.symbol}
                                            </p>
                                            <p className="text-xs text-gray-600">{ticker.name}</p>
                                        </div>
                                        {!isInWatchlist && canAdd && (
                                            <Plus className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="space-y-2">
                        <div className="rounded-md bg-white/5 p-3 border border-white/[0.08]">
                            <p className="text-xs text-gray-400">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Analysis runs automatically every night at 8 AM
                            </p>
                        </div>
                        <div className="rounded-md bg-purple-500/10 p-3 border border-purple-500/20">
                            <p className="text-xs text-purple-300 font-medium">
                                <Zap className="h-3 w-3 inline mr-1" />
                                Instant Analysis: {remainingAnalyses}/{dailyLimit} remaining today
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Analysis Reports */}
            <div className="bg-[#0a0a0a] p-6 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <LoadingSkeleton variant="card" count={3} />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <EmptyState
                            icon={Brain}
                            title="Failed to load watchlist"
                            description="There was an error loading your watchlist. Please try again."
                            action={{
                                label: "Retry",
                                onClick: refetch,
                            }}
                        />
                    </div>
                ) : watchlist.length === 0 ? (
                    <EmptyState
                        icon={Brain}
                        title="No tickers in watchlist"
                        description="Add stocks or crypto to your watchlist to receive daily AI-powered analysis reports."
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Analysis Reports</h2>
                            <p className="text-sm text-gray-500">
                                {watchlist.length} {watchlist.length === 1 ? "ticker" : "tickers"} tracked
                            </p>
                        </div>

                        {watchlist.map((ticker) => {
                            const report = analysisReports.get(ticker.symbol);

                            return (
                                <div
                                    key={ticker.id}
                                    className="rounded-lg border border-white/[0.08] bg-[#121212] p-6"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-mono-data text-lg font-bold text-white">
                                                {ticker.symbol}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Last analyzed:{" "}
                                                {ticker.last_analyzed_at
                                                    ? formatDistanceToNow(new Date(ticker.last_analyzed_at), {
                                                        addSuffix: true,
                                                    })
                                                    : "Never"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Instant Analysis Button */}
                                            <button
                                                onClick={() => handleRunAnalysis(ticker.symbol)}
                                                disabled={analyzingSymbol !== null || remainingAnalyses <= 0}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                                    analyzingSymbol === ticker.symbol
                                                        ? "bg-purple-500/20 text-purple-400"
                                                        : remainingAnalyses <= 0
                                                            ? "bg-gray-500/10 text-gray-500 cursor-not-allowed"
                                                            : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                                }`}
                                            >
                                                {analyzingSymbol === ticker.symbol ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="h-4 w-4" />
                                                        Analyze Now
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {report && (
                                            <div className="flex items-center gap-2">
                                                {/* Decision Badge */}
                                                <div
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${report.final_decision === "BUY"
                                                        ? "bg-green-500/10 text-green-500"
                                                        : report.final_decision === "SELL"
                                                            ? "bg-red-500/10 text-red-500"
                                                            : "bg-yellow-500/10 text-yellow-500"
                                                        }`}
                                                >
                                                    {report.final_decision === "BUY" ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : report.final_decision === "SELL" ? (
                                                        <TrendingDown className="h-4 w-4" />
                                                    ) : (
                                                        <Minus className="h-4 w-4" />
                                                    )}
                                                    {report.final_decision}
                                                </div>

                                                {/* Confidence */}
                                                <div className="px-3 py-1.5 rounded-md bg-white/5 text-sm font-medium text-white">
                                                    {Math.round(report.confidence * 100)}% confident
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                            {/* Report Content */}
                                            {report ? (
                                                <div className="space-y-6">
                                                    {/* Market Report */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                                                            Market Report
                                                        </h4>
                                                        <MarkdownRenderer content={report.market_report} />
                                                    </div>

                                                    {/* Risk Debate */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                                                            Risk Analysis
                                                        </h4>
                                                        <MarkdownRenderer 
                                                            content={typeof report.risk_debate === "object" && report.risk_debate ? (report.risk_debate as any).judge_decision : report.risk_debate} 
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                        <div className="text-center py-8">
                                            <Brain className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">
                                                No analysis available yet. Check back tomorrow morning.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
