"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTraderStore } from "@/store/useTraderStore";
import { formatCurrency, formatTimestamp } from "@/lib/utils";

interface ChartProps {
    type: "portfolio" | "positions";
}

export function PerformanceChart({ type }: ChartProps) {
    const { chartData } = useTraderStore();
    const data = type === "portfolio" ? chartData.portfolio : chartData.positions;

    // Transform data for Recharts
    const chartDataPoints = data.map((point) => ({
        time: formatTimestamp(point.timestamp),
        value: point.value,
        timestamp: point.timestamp,
    }));

    const isProfit = data.length > 0 && data[data.length - 1].value >= (data[0]?.value || 0);
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
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataPoints} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
    );
}
