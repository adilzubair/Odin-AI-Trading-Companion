"use client";

import { useAnalysisStore } from "@/store/useAnalysisStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Newspaper, Activity, Loader2 } from "lucide-react";
import type { AgentAnalysis } from "@/types";

const AGENT_ICONS = {
    fundamentals: Brain,
    sentiment: TrendingUp,
    news: Newspaper,
    technical: Activity,
};

const AGENT_LABELS = {
    fundamentals: "Fundamentals",
    sentiment: "Sentiment",
    news: "News",
    technical: "Technical",
};

function AgentCard({ analysis }: { analysis: AgentAnalysis }) {
    const Icon = AGENT_ICONS[analysis.agentType];

    const getStatusBadge = () => {
        if (analysis.status === "analyzing") {
            return <Badge variant="info">Analyzing...</Badge>;
        }
        if (analysis.status === "error") {
            return <Badge variant="danger">Error</Badge>;
        }
        if (analysis.verdict === "buy") {
            return <Badge variant="success">BUY</Badge>;
        }
        if (analysis.verdict === "sell") {
            return <Badge variant="danger">SELL</Badge>;
        }
        return <Badge variant="warning">HOLD</Badge>;
    };

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">
                        {AGENT_LABELS[analysis.agentType]}
                    </span>
                </div>
                {getStatusBadge()}
            </div>

            {analysis.status === "analyzing" ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing data...</span>
                </div>
            ) : analysis.status === "complete" ? (
                <>
                    <p className="text-sm text-slate-300">{analysis.summary}</p>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Confidence</span>
                        <span className="font-semibold text-blue-400">
                            {analysis.confidence}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ width: `${analysis.confidence}%` }}
                        />
                    </div>
                </>
            ) : (
                <p className="text-sm text-red-400">Analysis failed</p>
            )}
        </div>
    );
}

export function LiveAnalysis() {
    const { selectedTickers, liveAnalyses, isAnalyzing } = useAnalysisStore();

    if (selectedTickers.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Brain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                        Select tickers to start analysis
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {selectedTickers.map((ticker) => {
                const analyses = liveAnalyses.get(ticker.symbol) || [];

                return (
                    <Card key={ticker.symbol}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    {ticker.symbol}
                                    <span className="text-sm font-normal text-slate-400">
                                        {ticker.name}
                                    </span>
                                </CardTitle>
                                {isAnalyzing && (
                                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analyses.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">
                                    Waiting for analysis to start...
                                </p>
                            ) : (
                                analyses.map((analysis) => (
                                    <AgentCard
                                        key={analysis.agentType}
                                        analysis={analysis}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
