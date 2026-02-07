import { create } from "zustand";
import type { Ticker, AgentAnalysis, AnalysisReport } from "@/types";

interface AnalysisStore {
    selectedTickers: Ticker[];
    liveAnalyses: Map<string, AgentAnalysis[]>;
    reports: AnalysisReport[];
    isAnalyzing: boolean;

    // Actions
    addTicker: (ticker: Ticker) => void;
    removeTicker: (symbol: string) => void;
    clearTickers: () => void;
    updateLiveAnalysis: (ticker: string, analysis: AgentAnalysis) => void;
    addReport: (report: AnalysisReport) => void;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
    selectedTickers: [],
    liveAnalyses: new Map(),
    reports: [],
    isAnalyzing: false,

    addTicker: (ticker) =>
        set((state) => {
            if (state.selectedTickers.length >= 5) {
                return state; // Max 5 tickers
            }
            if (state.selectedTickers.some((t) => t.symbol === ticker.symbol)) {
                return state; // Already exists
            }
            return {
                selectedTickers: [...state.selectedTickers, ticker],
            };
        }),

    removeTicker: (symbol) =>
        set((state) => ({
            selectedTickers: state.selectedTickers.filter((t) => t.symbol !== symbol),
        })),

    clearTickers: () =>
        set({
            selectedTickers: [],
            liveAnalyses: new Map(),
        }),

    updateLiveAnalysis: (ticker, analysis) =>
        set((state) => {
            const newAnalyses = new Map(state.liveAnalyses);
            const currentAnalyses = newAnalyses.get(ticker) || [];

            // Update or add the analysis
            const existingIndex = currentAnalyses.findIndex(
                (a) => a.agentType === analysis.agentType
            );

            if (existingIndex >= 0) {
                currentAnalyses[existingIndex] = analysis;
            } else {
                currentAnalyses.push(analysis);
            }

            newAnalyses.set(ticker, currentAnalyses);

            return { liveAnalyses: newAnalyses };
        }),

    addReport: (report) =>
        set((state) => ({
            reports: [report, ...state.reports].slice(0, 20), // Keep last 20 reports
        })),

    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));
