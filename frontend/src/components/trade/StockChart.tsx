"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { StockDetail, Timeframe } from "@/types";
import { formatCurrency, formatTimestamp } from "@/lib/utils";

interface StockChartProps {
    stock: StockDetail;
}

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "All"];

export default function StockChart({ stock }: StockChartProps) {
    const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("1D");

    // Safely access chart data with fallback - also check lowercase variant for API compatibility
    const rawData = stock.chartData?.[selectedTimeframe] || stock.chartData?.["1d" as Timeframe] || [];
    
    const chartData = rawData.map((point) => ({
        time: formatTimestamp(point.timestamp),
        value: point.value,
        timestamp: point.timestamp,
    }));

    const isProfit = chartData.length > 0 && chartData[chartData.length - 1].value >= chartData[0].value;
    const lineColor = isProfit ? "#22c55e" : "#ef4444";

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-white/[0.08] bg-[#121212] p-3 shadow-xl">
                    <p className="text-xs text-gray-500 mb-1">{payload[0].payload.time}</p>
                    <p className={`font-mono-data text-sm font-semibold ${isProfit ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Chart */}
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="time"
                            stroke="transparent"
                            axisLine={false}
                            style={{ fontSize: "10px" }}
                            tick={{ fill: "#737373" }}
                        />
                        <YAxis
                            stroke="transparent"
                            axisLine={false}
                            style={{ fontSize: "10px" }}
                            tick={{ fill: "#737373" }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={1.5}
                            dot={false}
                            animationDuration={500}
                            animationEasing="ease-in-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-2 flex-wrap">
                {TIMEFRAMES.map((timeframe) => (
                    <button
                        key={timeframe}
                        onClick={() => setSelectedTimeframe(timeframe)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedTimeframe === timeframe
                                ? "bg-white text-black"
                                : "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222222]"
                            }`}
                    >
                        {timeframe}
                    </button>
                ))}
            </div>
        </div>
    );
}
