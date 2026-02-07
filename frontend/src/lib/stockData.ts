import type { Stock, StockDetail, ChartDataPoint, Timeframe } from "@/types";

// Popular stocks data
const POPULAR_STOCKS = [
    { ticker: "AAPL", name: "Apple Inc." },
    { ticker: "NVDA", name: "NVIDIA Corporation" },
    { ticker: "MSFT", name: "Microsoft Corporation" },
    { ticker: "GOOGL", name: "Alphabet Inc." },
    { ticker: "TSLA", name: "Tesla, Inc." },
    { ticker: "AMZN", name: "Amazon.com Inc." },
    { ticker: "META", name: "Meta Platforms Inc." },
    { ticker: "BTC", name: "Bitcoin" },
    { ticker: "ETH", name: "Ethereum" },
    { ticker: "SOL", name: "Solana" },
];

// Generate random price data
function generatePrice(basePrice: number, volatility: number = 0.1): number {
    const change = (Math.random() - 0.5) * 2 * volatility;
    return basePrice * (1 + change);
}

// Generate chart data for a specific timeframe
export function generateStockChartData(basePrice: number, timeframe: Timeframe): ChartDataPoint[] {
    const now = Date.now();
    let points: number;
    let interval: number;

    switch (timeframe) {
        case "1D":
            points = 78; // 5-minute intervals for 6.5 hours (trading day)
            interval = 5 * 60 * 1000;
            break;
        case "1W":
            points = 35; // 30-minute intervals for 5 days
            interval = 30 * 60 * 1000;
            break;
        case "1M":
            points = 30; // Daily data for 1 month
            interval = 24 * 60 * 60 * 1000;
            break;
        case "3M":
            points = 90; // Daily data for 3 months
            interval = 24 * 60 * 60 * 1000;
            break;
        case "6M":
            points = 180; // Daily data for 6 months
            interval = 24 * 60 * 60 * 1000;
            break;
        case "1Y":
            points = 252; // Trading days in a year
            interval = 24 * 60 * 60 * 1000;
            break;
        case "3Y":
            points = 156; // Weekly data for 3 years
            interval = 7 * 24 * 60 * 60 * 1000;
            break;
        case "5Y":
            points = 260; // Weekly data for 5 years
            interval = 7 * 24 * 60 * 60 * 1000;
            break;
        case "All":
            points = 520; // Weekly data for 10 years
            interval = 7 * 24 * 60 * 60 * 1000;
            break;
    }

    const data: ChartDataPoint[] = [];
    let currentValue = basePrice;

    for (let i = points; i >= 0; i--) {
        // Random walk with slight upward bias for longer timeframes
        const bias = timeframe === "1D" || timeframe === "1W" ? 0 : 0.0002;
        const volatility = timeframe === "1D" ? 0.005 : 0.01;
        const change = (Math.random() - 0.5 + bias) * volatility;
        currentValue = currentValue * (1 + change);

        data.push({
            timestamp: now - (i * interval),
            value: Math.max(currentValue, basePrice * 0.5), // Don't go below 50% of base
        });
    }

    return data;
}

// Generate mini chart data for stock list (last 24 hours)
function generateMiniChartData(basePrice: number): ChartDataPoint[] {
    const now = Date.now();
    const points = 24;
    const interval = 60 * 60 * 1000; // 1 hour
    const data: ChartDataPoint[] = [];
    let currentValue = basePrice;

    for (let i = points; i >= 0; i--) {
        const change = (Math.random() - 0.5) * 0.01; // ±1%
        currentValue = currentValue * (1 + change);

        data.push({
            timestamp: now - (i * interval),
            value: currentValue,
        });
    }

    return data;
}

// Generate popular stocks list
export function generatePopularStocks(): Stock[] {
    return POPULAR_STOCKS.map((stock) => {
        const basePrice = Math.random() * 500 + 50; // $50 - $550
        const miniChartData = generateMiniChartData(basePrice);
        const currentPrice = miniChartData[miniChartData.length - 1].value;
        const previousPrice = miniChartData[0].value;
        const change = currentPrice - previousPrice;
        const changePercentage = (change / previousPrice) * 100;

        return {
            ticker: stock.ticker,
            name: stock.name,
            price: currentPrice,
            change,
            changePercentage,
            miniChartData,
        };
    });
}

// Get detailed stock information
export function getStockDetail(ticker: string): StockDetail | null {
    const stockInfo = POPULAR_STOCKS.find((s) => s.ticker === ticker);
    if (!stockInfo) return null;

    const basePrice = Math.random() * 500 + 50;
    const miniChartData = generateMiniChartData(basePrice);
    const currentPrice = miniChartData[miniChartData.length - 1].value;
    const previousPrice = miniChartData[0].value;
    const change = currentPrice - previousPrice;
    const changePercentage = (change / previousPrice) * 100;

    // Generate chart data for all timeframes
    const chartData: Record<Timeframe, ChartDataPoint[]> = {
        "1D": generateStockChartData(basePrice, "1D"),
        "1W": generateStockChartData(basePrice, "1W"),
        "1M": generateStockChartData(basePrice, "1M"),
        "3M": generateStockChartData(basePrice, "3M"),
        "6M": generateStockChartData(basePrice, "6M"),
        "1Y": generateStockChartData(basePrice, "1Y"),
        "3Y": generateStockChartData(basePrice, "3Y"),
        "5Y": generateStockChartData(basePrice, "5Y"),
        "All": generateStockChartData(basePrice, "All"),
    };

    return {
        ticker: stockInfo.ticker,
        name: stockInfo.name,
        price: currentPrice,
        change,
        changePercentage,
        miniChartData,
        chartData,
    };
}

// Search stocks by query
export function searchStocks(query: string): Stock[] {
    const allStocks = generatePopularStocks();
    if (!query.trim()) return allStocks;

    const lowerQuery = query.toLowerCase();
    return allStocks.filter(
        (stock) =>
            stock.ticker.toLowerCase().includes(lowerQuery) ||
            stock.name.toLowerCase().includes(lowerQuery)
    );
}
