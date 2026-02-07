"use client";

import type { StockDetail as StockDetailType } from "@/types";
import StockChart from "./StockChart";
import TradingPanel from "./TradingPanel";

interface StockDetailProps {
    stock: StockDetailType;
}

export default function StockDetail({ stock }: StockDetailProps) {
    const isPositive = stock.changePercentage >= 0;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Stock Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{stock.name}</h1>
                    <span className="text-lg text-gray-500">{stock.ticker}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-mono-data text-4xl font-semibold text-white">
                        ${stock.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                        <span
                            className={`font-mono-data text-lg font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            {isPositive ? "+" : ""}${Math.abs(stock.change).toFixed(2)}
                        </span>
                        <span
                            className={`font-mono-data text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            ({isPositive ? "+" : ""}
                            {stock.changePercentage.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section - Takes 2 columns */}
                <div className="lg:col-span-2 rounded-lg border border-white/[0.08] bg-[#121212] p-6">
                    <StockChart stock={stock} />
                </div>

                {/* Trading Panel - Takes 1 column */}
                <div className="lg:col-span-1">
                    <TradingPanel
                        stock={{
                            ticker: stock.ticker,
                            name: stock.name,
                            price: stock.price,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
