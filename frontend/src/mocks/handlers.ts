import { http, HttpResponse, delay } from "msw";
import {
    mockWatchlist,
    mockAnalysisReports,
    getNextTickerId,
} from "@/mocks/data/mockWatchlist";
import {
    mockAutonomousStatus,
    mockAutonomousConfig,
} from "@/mocks/data/mockAutonomous";
import {
    mockTradeHistory,
    mockPositions,
    mockSentinelAlerts,
} from "@/mocks/data/mockTrades";
import type {
    MonitoredTicker,
    AnalysisResponse,
    TradeRequest,
    TradeResponse,
    UpdateConfigRequest,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// In-memory storage for mock data (will reset on page refresh)
let watchlistData = [...mockWatchlist];
let autonomousConfig = { ...mockAutonomousConfig };
let autonomousStatus = { ...mockAutonomousStatus };
let alertsData = [...mockSentinelAlerts];

export const handlers = [
    // ==================== MONITOR/WATCHLIST ENDPOINTS ====================

    // GET /monitor/list - Get watchlist
    http.get(`${API_BASE_URL}/monitor/list`, async () => {
        await delay(300); // Simulate network delay
        return HttpResponse.json(watchlistData);
    }),

    // POST /monitor/add - Add ticker to watchlist
    http.post(`${API_BASE_URL}/monitor/add`, async ({ request }) => {
        await delay(300);
        const body = await request.json() as { symbol: string };
        const { symbol } = body;

        // Check if already exists
        const exists = watchlistData.find((t) => t.symbol === symbol);
        if (exists) {
            return HttpResponse.json(
                {
                    error: {
                        code: "TICKER_ALREADY_EXISTS",
                        message: `${symbol} is already in your watchlist`,
                    },
                },
                { status: 400 }
            );
        }

        // Add new ticker
        const newTicker: MonitoredTicker = {
            id: getNextTickerId(),
            symbol,
            is_active: true,
            added_at: new Date().toISOString(),
            last_analyzed_at: null,
        };

        watchlistData.push(newTicker);
        return HttpResponse.json(newTicker, { status: 201 });
    }),

    // DELETE /monitor/remove - Remove ticker from watchlist
    http.delete(`${API_BASE_URL}/monitor/remove`, async ({ request }) => {
        await delay(300);
        const body = await request.json() as { symbol: string };
        const { symbol } = body;

        const index = watchlistData.findIndex((t) => t.symbol === symbol);
        if (index === -1) {
            return HttpResponse.json(
                {
                    error: {
                        code: "TICKER_NOT_FOUND",
                        message: `${symbol} not found in watchlist`,
                    },
                },
                { status: 404 }
            );
        }

        watchlistData.splice(index, 1);
        return HttpResponse.json({ success: true });
    }),

    // GET /analysis/history/:ticker - Get analysis history (NEW FORMAT)
    http.get(`${API_BASE_URL}/analysis/history/:ticker`, async ({ params }) => {
        await delay(300);
        const { ticker } = params;
        const report = mockAnalysisReports[ticker as string];

        if (!report) {
            return HttpResponse.json({
                ticker: ticker as string,
                reports: [],
            });
        }

        // Backend returns reports array wrapped in object
        return HttpResponse.json({
            ticker: ticker as string,
            reports: [report],
        });
    }),

    // ==================== AUTONOMOUS ENDPOINTS ====================

    // GET /autonomous/status - Get autonomous status
    http.get(`${API_BASE_URL}/autonomous/status`, async () => {
        await delay(200);
        return HttpResponse.json(autonomousStatus);
    }),

    // GET /autonomous/config - Get autonomous config
    http.get(`${API_BASE_URL}/autonomous/config`, async () => {
        await delay(200);
        return HttpResponse.json(autonomousConfig);
    }),

    // POST /autonomous/config - Update autonomous config
    http.post(`${API_BASE_URL}/autonomous/config`, async ({ request }) => {
        await delay(300);
        const body = await request.json() as UpdateConfigRequest;

        // Update config
        autonomousConfig = { ...autonomousConfig, ...body };

        // Update status if is_autonomous_active changed
        if (body.is_autonomous_active !== undefined) {
            autonomousStatus.is_active = body.is_autonomous_active;
        }

        return HttpResponse.json(autonomousConfig);
    }),

    // ==================== TRADES ENDPOINTS ====================

    // POST /trades/execute - Execute a trade
    http.post(`${API_BASE_URL}/trades/execute`, async ({ request }) => {
        await delay(500); // Simulate trade execution delay
        const body = await request.json() as TradeRequest;

        // Simulate trade response
        const response: TradeResponse = {
            order_id: `order_${Date.now()}`,
            symbol: body.symbol,
            side: body.side,
            quantity: body.quantity,
            status: "filled",
            filled_price: body.limit_price || 100.0,
            timestamp: new Date().toISOString(),
        };

        return HttpResponse.json(response, { status: 201 });
    }),

    // GET /trades/history - Get trade history (NEW FORMAT)
    http.get(`${API_BASE_URL}/trades/history`, async () => {
        await delay(300);
        // Backend returns trades wrapped in object with total_count
        return HttpResponse.json({
            trades: mockTradeHistory,
            total_count: mockTradeHistory.length,
        });
    }),

    // ==================== POSITIONS ENDPOINTS ====================

    // GET /positions - Get positions (NEW FORMAT)
    http.get(`${API_BASE_URL}/positions`, async () => {
        await delay(300);
        // Backend returns positions wrapped in object with totals
        const totalMarketValue = mockPositions.reduce((sum, p) => sum + (p.market_value || 0), 0);
        const totalUnrealizedPnl = mockPositions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);

        return HttpResponse.json({
            positions: mockPositions,
            total_market_value: totalMarketValue,
            total_unrealized_pnl: totalUnrealizedPnl,
        });
    }),

    // ==================== SENTINEL ENDPOINTS ====================

    // GET /sentinel/alerts - Get alerts
    http.get(`${API_BASE_URL}/sentinel/alerts`, async () => {
        await delay(200);
        return HttpResponse.json(alertsData);
    }),

    // POST /sentinel/alerts/:id/read - Mark alert as read
    http.post(`${API_BASE_URL}/sentinel/alerts/:id/read`, async ({ params }) => {
        await delay(200);
        const alertId = parseInt(params.id as string);

        const alert = alertsData.find((a) => a.id === alertId);
        if (alert) {
            alert.is_read = true;
        }

        return HttpResponse.json({ success: true });
    }),

    // ==================== OBSERVER ENDPOINTS ====================

    // POST /observer/log - Log user action
    http.post(`${API_BASE_URL}/observer/log`, async ({ request }) => {
        await delay(100);
        const body = await request.json();
        console.log("[Observer Mock] Logged action:", body);
        return HttpResponse.json({ success: true });
    }),
];
