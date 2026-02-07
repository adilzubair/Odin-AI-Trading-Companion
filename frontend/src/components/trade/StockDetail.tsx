"use client";

import { useState, useMemo } from "react";
import type { StockDetail as StockDetailType } from "@/types";
import StockChart from "./StockChart";
import TradingPanel from "./TradingPanel";
import { useMarketWebSocket } from "@/hooks/useMarketWebSocket";

interface StockDetailProps {
    stock: StockDetailType;
}

export default function StockDetail({ stock }: StockDetailProps) {
    const [currentStock, setCurrentStock] = useState<StockDetailType>(stock);

    // Subscribe to real-time updates for this stock
    // Memoize the tickers array to prevent infinite reconnection loops
    const tickers = useMemo(() => [stock.ticker], [stock.ticker]);

    useMarketWebSocket({
        tickers,
        enabled: true,
        onPriceUpdate: (update) => {
            if (update.ticker === currentStock.ticker) {
                setCurrentStock(prev => {
                    // Update chart data for all timeframes by appending the new point
                    // For simplicity, we just append to the current view, but ideally 
                    // we'd update specifically the intraday (1D) data
                    const newPoint = {
                        timestamp: update.timestamp ? new Date(update.timestamp).getTime() : Date.now(),
                        value: update.price
                    };

                    const updatedChartData = { ...prev.chartData };

                    // Update 1D chart data if it exists
                    if (updatedChartData["1d"]) {
                        updatedChartData["1d"] = [...updatedChartData["1d"], newPoint];
                    } else if (updatedChartData["1D"]) { // Handle potential casing diffs
                        updatedChartData["1D"] = [...updatedChartData["1D"], newPoint];
                    }

                    // Calculate new change
                    const oldPrice = prev.price;
                    // If we have history, calculate from previous close, otherwise just diff
                    // Ideally we keep the original prev_close from the API response
                    const change = update.price - (prev.price - prev.change);
                    const changePercentage = prev.price > 0
                        ? (change / (prev.price - prev.change)) * 100
                        : 0;

                    return {
                        ...prev,
                        price: update.price,
                        change: change,
                        changePercentage: changePercentage,
                        chartData: updatedChartData
                    };
                });
            }
        },
        onError: (err) => console.error("WebSocket error in detail view:", err)
    });

    const isPositive = currentStock.changePercentage >= 0;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Stock Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{currentStock.name}</h1>
                    <span className="text-lg text-gray-500">{currentStock.ticker}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-mono-data text-4xl font-semibold text-white">
                        ${currentStock.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                        <span
                            className={`font-mono-data text-lg font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            {isPositive ? "+" : ""}${Math.abs(currentStock.change).toFixed(2)}
                        </span>
                        <span
                            className={`font-mono-data text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            ({isPositive ? "+" : ""}
                            {currentStock.changePercentage.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section - Takes 2 columns */}
                <div className="lg:col-span-2 rounded-lg border border-white/[0.08] bg-[#121212] p-6">
                    <StockChart stock={currentStock} />
                </div>

                {/* Trading Panel - Takes 1 column */}
                <div className="lg:col-span-1">
                    <TradingPanel
                        stock={{
                            ticker: currentStock.ticker,
                            name: currentStock.name,
                            price: currentStock.price,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
