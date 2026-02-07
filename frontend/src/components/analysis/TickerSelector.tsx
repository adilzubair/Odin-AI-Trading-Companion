"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ticker } from "@/types";

// Mock data for popular tickers
const POPULAR_STOCKS: Ticker[] = [
    { symbol: "AAPL", type: "stock", name: "Apple Inc." },
    { symbol: "NVDA", type: "stock", name: "NVIDIA Corporation" },
    { symbol: "MSFT", type: "stock", name: "Microsoft Corporation" },
    { symbol: "GOOGL", type: "stock", name: "Alphabet Inc." },
    { symbol: "TSLA", type: "stock", name: "Tesla, Inc." },
    { symbol: "AMZN", type: "stock", name: "Amazon.com Inc." },
    { symbol: "META", type: "stock", name: "Meta Platforms Inc." },
];

const POPULAR_CRYPTO: Ticker[] = [
    { symbol: "BTC", type: "crypto", name: "Bitcoin" },
    { symbol: "ETH", type: "crypto", name: "Ethereum" },
    { symbol: "SOL", type: "crypto", name: "Solana" },
    { symbol: "BNB", type: "crypto", name: "Binance Coin" },
];

export function TickerSelector() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"stocks" | "crypto">("stocks");
    const { selectedTickers, addTicker, removeTicker } = useAnalysisStore();

    const availableTickers = activeTab === "stocks" ? POPULAR_STOCKS : POPULAR_CRYPTO;
    const filteredTickers = availableTickers.filter(
        (ticker) =>
            ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticker.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const canAddMore = selectedTickers.length < 5;

    return (
        <Card className="p-4">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Select Tickers</h3>
                    <Badge variant="info">
                        {selectedTickers.length}/5 Selected
                    </Badge>
                </div>

                {/* Selected Tickers */}
                {selectedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedTickers.map((ticker) => (
                            <div
                                key={ticker.symbol}
                                className="flex items-center gap-1 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-sm"
                            >
                                <span className="font-semibold text-blue-400">
                                    {ticker.symbol}
                                </span>
                                <button
                                    onClick={() => removeTicker(ticker.symbol)}
                                    className="ml-1 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("stocks")}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "stocks"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Stocks
                    </button>
                    <button
                        onClick={() => setActiveTab("crypto")}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "crypto"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Crypto
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tickers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                {/* Ticker List */}
                <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {filteredTickers.map((ticker) => {
                        const isSelected = selectedTickers.some(
                            (t) => t.symbol === ticker.symbol
                        );
                        const isDisabled = !canAddMore && !isSelected;

                        return (
                            <button
                                key={ticker.symbol}
                                onClick={() => {
                                    if (isSelected) {
                                        removeTicker(ticker.symbol);
                                    } else if (canAddMore) {
                                        addTicker(ticker);
                                    }
                                }}
                                disabled={isDisabled}
                                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${isSelected
                                        ? "bg-blue-500/20 border border-blue-500/30"
                                        : isDisabled
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-white/5 border border-transparent"
                                    }`}
                            >
                                <div>
                                    <div className="font-semibold text-white">{ticker.symbol}</div>
                                    <div className="text-xs text-slate-400">{ticker.name}</div>
                                </div>
                                {isSelected && (
                                    <Badge variant="success">Selected</Badge>
                                )}
                            </button>
                        );
                    })}
                </div>

                {!canAddMore && (
                    <p className="text-xs text-yellow-400 text-center">
                        Maximum 5 tickers reached. Remove one to add more.
                    </p>
                )}
            </div>
        </Card>
    );
}
