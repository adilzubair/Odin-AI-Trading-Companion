"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { apiClient } from "@/services/api/client";
import type { Stock } from "@/types";

interface PopularStocksProps {
    onSelectStock: (ticker: string) => void;
}

// Type for API response
interface PopularStockResponse {
    ticker: string;
    name: string;
    price: number;
    changePercentage: number;
    miniChartData: Array<{ value: number }>;
}

export default function PopularStocks({ onSelectStock }: PopularStocksProps) {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopularStocks = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<PopularStockResponse[]>("/market/popular");
                
                // Map API response to Stock type
                const mappedStocks: Stock[] = response.data.map((stock) => ({
                    ticker: stock.ticker,
                    name: stock.name,
                    price: stock.price,
                    change: stock.price * (stock.changePercentage / 100), // Calculate change from percentage
                    changePercentage: stock.changePercentage,
                    miniChartData: stock.miniChartData?.length > 0 
                        ? stock.miniChartData.map((d, i) => ({ timestamp: Date.now() - (stock.miniChartData.length - i) * 60000, value: d.value }))
                        : [
                            { timestamp: Date.now() - 120000, value: stock.price * 0.98 }, 
                            { timestamp: Date.now() - 60000, value: stock.price * 0.99 }, 
                            { timestamp: Date.now(), value: stock.price }
                        ],
                }));
                
                setStocks(mappedStocks);
            } catch (err) {
                console.error("Failed to fetch popular stocks:", err);
                setError("Failed to load market data");
            } finally {
                setLoading(false);
            }
        };

        fetchPopularStocks();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchPopularStocks, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && stocks.length === 0) {
        return (
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Popular Stocks</h3>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-lg border border-white/[0.08] bg-[#121212] p-4 animate-pulse">
                            <div className="h-12 bg-gray-800 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && stocks.length === 0) {
        return (
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Popular Stocks</h3>
                <div className="text-red-400 text-sm">{error}</div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Popular Stocks</h3>
            <div className="space-y-2">
                {stocks.map((stock) => {
                    const isPositive = stock.changePercentage >= 0;
                    return (
                        <button
                            key={stock.ticker}
                            onClick={() => onSelectStock(stock.ticker)}
                            className="w-full rounded-lg border border-white/[0.08] bg-[#121212] p-4 hover:bg-[#1a1a1a] transition-colors text-left"
                        >
                            <div className="flex items-center justify-between gap-4">
                                {/* Stock Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white">{stock.ticker}</span>
                                        <span className="text-xs text-gray-500 truncate">{stock.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono-data text-sm text-white">
                                            ${stock.price.toFixed(2)}
                                        </span>
                                        <span
                                            className={`font-mono-data text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                                }`}
                                        >
                                            {isPositive ? "+" : ""}
                                            {stock.changePercentage.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Mini Chart */}
                                <div className="w-24 h-12">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stock.miniChartData}>
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={isPositive ? "#22c55e" : "#ef4444"}
                                                strokeWidth={1.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
