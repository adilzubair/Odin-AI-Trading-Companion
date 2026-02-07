"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { apiClient } from "@/services/api/client";
import { useMarketWebSocket } from "@/hooks/useMarketWebSocket";
import PortfolioSummary from "@/components/trade/PortfolioSummary";
import PositionsList from "@/components/trade/PositionsList";
import PopularStocks from "@/components/trade/PopularStocks";
import StockDetail from "@/components/trade/StockDetail";
import type { StockDetail as StockDetailType } from "@/types";

export default function TradeTab() {
    const { selectedStock, setSelectedStock, clearSelectedStock, positions, updatePositionPrice } = useTradeStore();
    const [view, setView] = useState<"list" | "detail">("list");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic subscription to all held positions for real-time portfolio updates
    const positionTickers = positions.map(p => p.ticker);

    useMarketWebSocket({
        tickers: positionTickers,
        enabled: positions.length > 0,
        onPriceUpdate: (update) => {
            updatePositionPrice(update.ticker, update.price);
        }
    });

    const handleStockSelect = async (ticker: string) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch real stock detail from API
            const response = await apiClient.get<{
                ticker: string;
                name: string;
                price: number;
                change: number;
                changePercentage: number;
                chartData: Record<string, Array<{ timestamp: number; value: number }>>;
            }>(`/market/detail/${ticker}`);

            const data = response.data;

            // Map API response to StockDetailType
            const stockDetail: StockDetailType = {
                ticker: data.ticker,
                name: data.name,
                price: data.price,
                change: data.change,
                changePercentage: data.changePercentage,
                miniChartData: data.chartData?.["1d"]?.slice(-10).map((d, i) => ({
                    timestamp: Date.now() - (10 - i) * 60000,
                    value: d.value
                })) || [],
                chartData: data.chartData || { "1d": [] },
            };

            setSelectedStock(stockDetail);
            setView("detail");
        } catch (err) {
            console.error("Failed to fetch stock detail:", err);
            setError("Failed to load stock data");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setView("list");
        clearSelectedStock();
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
            {view === "list" ? (
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Trade</h2>
                        <p className="text-sm text-gray-500">Manage your portfolio and trade stocks</p>
                    </div>

                    {/* Portfolio Summary */}
                    <PortfolioSummary />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Positions */}
                        <div className="lg:col-span-2 space-y-8">
                            <PositionsList />
                        </div>

                        {/* Right Column: Market/Popular Stocks */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Market Overview</h3>
                            {/* Error Message */}
                            {error && (
                                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Loading Overlay */}
                            {loading && (
                                <div className="text-gray-400 text-sm">Loading stock details...</div>
                            )}

                            {/* Popular Stocks */}
                            <PopularStocks onSelectStock={handleStockSelect} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full">
                    {/* Back Button */}
                    <div className="border-b border-white/[0.08] bg-[#0a0a0a] px-6 py-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to stocks
                        </button>
                    </div>

                    {/* Stock Detail */}
                    {selectedStock && <StockDetail stock={selectedStock} />}
                </div>
            )}
        </div>
    );
}
