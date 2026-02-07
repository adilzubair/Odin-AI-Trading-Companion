"use client";

import { useTradeStore } from "@/store/useTradeStore";
import { formatCurrency } from "@/lib/utils";

export default function PositionsList() {
    const { positions } = useTradeStore();

    if (positions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-[#121212] rounded-lg border border-white/[0.08]">
                No active positions. Start trading to build your portfolio!
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-white/[0.08] bg-[#121212] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white">Your Positions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#1a1a1a] text-xs text-gray-500 uppercase">
                            <th className="px-6 py-3 font-medium">Asset</th>
                            <th className="px-6 py-3 font-medium text-right">Quantity</th>
                            <th className="px-6 py-3 font-medium text-right">Avg Price</th>
                            <th className="px-6 py-3 font-medium text-right">Current Price</th>
                            <th className="px-6 py-3 font-medium text-right">Total Value</th>
                            <th className="px-6 py-3 font-medium text-right">Return</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.08]">
                        {positions.map((pos) => {
                            const isPositive = pos.change >= 0;
                            return (
                                <tr key={pos.ticker} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-white">{pos.ticker}</div>
                                            <div className="text-xs text-gray-500">{pos.stockName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono-data text-white">
                                        {pos.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono-data text-gray-400">
                                        {formatCurrency(pos.avgPrice)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono-data text-white">
                                        {formatCurrency(pos.currentPrice)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono-data text-white font-medium">
                                        {formatCurrency(pos.totalValue)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`font-mono-data font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                            {isPositive ? "+" : ""}{formatCurrency(pos.change)}
                                        </div>
                                        <div className={`text-xs font-mono-data ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                            ({isPositive ? "+" : ""}{pos.changePercentage.toFixed(2)}%)
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
