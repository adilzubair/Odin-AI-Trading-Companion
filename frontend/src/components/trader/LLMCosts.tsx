"use client";

import { useTraderStore } from "@/store/useTraderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export function LLMCosts() {
    const { llmCosts } = useTraderStore();

    const stats = [
        {
            label: "Total Spend",
            value: formatCurrency(llmCosts.totalSpend),
            icon: DollarSign,
            color: "text-blue-400",
        },
        {
            label: "API Calls",
            value: llmCosts.totalApiCalls.toString(),
            icon: TrendingUp,
            color: "text-purple-400",
        },
        {
            label: "Model",
            value: llmCosts.model,
            icon: TrendingDown,
            color: "text-green-400",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                    LLM Costs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="text-center">
                                <Icon className={`h-4 w-4 mx-auto mb-2 ${stat.color}`} />
                                <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                                <p className={`text-lg font-bold ${stat.color}`}>
                                    {stat.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
