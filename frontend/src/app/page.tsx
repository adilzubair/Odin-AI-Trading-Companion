"use client";

import { useState } from "react";
import { Brain, TrendingUp, ShoppingCart } from "lucide-react";
import AnalysisTab from "@/components/tabs/AnalysisTab";
import TraderTab from "@/components/tabs/TraderTab";
import TradeTab from "@/components/tabs/TradeTab";
import { useMockData } from "@/hooks/useMockData";

export default function Home() {
  useMockData();
  const [activeTab, setActiveTab] = useState<"analysis" | "autoTrade" | "trade">("analysis");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <span className="text-xs font-bold text-black">MT</span>
            </div>
            <div>
              <h1 className="text-sm font-medium text-white">Multi-Agent Trader</h1>
              <p className="text-xs text-gray-500">AI Trading Intelligence</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors relative ${activeTab === "analysis"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <Brain className="h-4 w-4" />
              Analysis
              {activeTab === "analysis" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("autoTrade")}
              className={`flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors relative ${activeTab === "autoTrade"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <TrendingUp className="h-4 w-4" />
              Auto Trade
              {activeTab === "autoTrade" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("trade")}
              className={`flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors relative ${activeTab === "trade"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Trade
              {activeTab === "trade" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-dot" />
              <span className="text-xs font-medium text-gray-400">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="h-[calc(100vh-57px)] overflow-hidden">
        {activeTab === "analysis" ? (
          <div className="animate-fadeIn h-full">
            <AnalysisTab />
          </div>
        ) : activeTab === "autoTrade" ? (
          <div className="animate-fadeIn h-full">
            <TraderTab />
          </div>
        ) : (
          <div className="animate-fadeIn h-full">
            <TradeTab />
          </div>
        )}
      </main>
    </div>
  );
}
