"use client";

import { useState } from "react";
import { useTradeStore } from "@/store/useTradeStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface TradingPanelProps {
    stock: {
        ticker: string;
        name: string;
        price: number;
    };
}

export default function TradingPanel({ stock }: TradingPanelProps) {
    const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
    const [quantity, setQuantity] = useState<string>("");
    const { executeTrade, positions } = useTradeStore();

    const quantityNum = parseInt(quantity) || 0;
    const total = quantityNum * stock.price;

    // Calculate available shares for selling
    const currentPosition = positions.find(p => p.ticker === stock.ticker);
    const availableShares = currentPosition ? currentPosition.quantity : 0;

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow positive integers
        if (value === "" || /^[1-9]\d*$/.test(value)) {
            setQuantity(value);
        }
    };

    const handleTrade = () => {
        if (quantityNum > 0) {
            // Validation for Sell
            if (activeTab === "sell" && quantityNum > availableShares) {
                toast.error(`Insufficient shares. You only have ${availableShares} shares.`);
                return;
            }

            executeTrade({
                type: activeTab,
                ticker: stock.ticker,
                stockName: stock.name,
                quantity: quantityNum,
                price: stock.price,
                total,
            });

            // Reset quantity
            setQuantity("");

            // Show success message
            toast.success(`${activeTab === "buy" ? "Bought" : "Sold"} ${quantityNum} shares of ${stock.ticker}`, {
                description: `Total: ${formatCurrency(total)}`,
            });

            console.log(`${activeTab.toUpperCase()} order executed:`, {
                ticker: stock.ticker,
                quantity: quantityNum,
                total,
            });
        }
    };

    return (
        <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-6 space-y-6">
            {/* Buy/Sell Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("buy")}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === "buy"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                        }`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setActiveTab("sell")}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === "sell"
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                        }`}
                >
                    SELL
                </button>
            </div>

            {/* Quantity Input */}
            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-gray-500">Quantity</label>
                    {activeTab === "sell" && (
                        <span className="text-xs text-gray-400">
                            Available: <span className="text-white font-mono-data">{availableShares}</span>
                        </span>
                    )}
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    value={quantity}
                    onChange={handleQuantityChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 py-3 text-white font-mono-data text-lg focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />

                {/* Helper text / Quick actions could go here */}
                {activeTab === "sell" && availableShares > 0 && (
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => setQuantity(availableShares.toString())}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Sell Max
                        </button>
                    </div>
                )}
            </div>

            {/* Price */}
            <div>
                <label className="block text-xs text-gray-500 mb-2">Price</label>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 py-3">
                    <span className="text-sm text-gray-400">Market</span>
                    <span className="font-mono-data text-lg text-white">{formatCurrency(stock.price)}</span>
                </div>
            </div>

            {/* Total */}
            <div>
                <label className="block text-xs text-gray-500 mb-2">Total</label>
                <div className="rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 py-3">
                    <span className="font-mono-data text-2xl font-semibold text-white">
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleTrade}
                disabled={quantityNum === 0 || (activeTab === "sell" && quantityNum > availableShares)}
                className={`w-full py-3.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "buy"
                    ? "bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/30 disabled:cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30 disabled:cursor-not-allowed"
                    }`}
            >
                {activeTab === "buy" ? "Buy" : "Sell"}
            </button>

        </div>
    );
}
