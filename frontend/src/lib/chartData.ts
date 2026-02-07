import type { ChartDataPoint } from "@/types";

// Generate mock chart data for performance visualization
export function generateChartData(baseValue: number, points: number = 24): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    let currentValue = baseValue;

    for (let i = points; i >= 0; i--) {
        // Random walk with slight upward bias
        const change = (Math.random() - 0.48) * (baseValue * 0.02); // ±2% with slight upward bias
        currentValue += change;

        data.push({
            timestamp: now - (i * hourInMs),
            value: Math.max(currentValue, baseValue * 0.8), // Don't go below 80% of base
        });
    }

    return data;
}

// Simulate real-time chart updates
export function updateChartData(existingData: ChartDataPoint[], baseValue: number): ChartDataPoint[] {
    const now = Date.now();
    const lastValue = existingData[existingData.length - 1]?.value || baseValue;

    // Add new point
    const change = (Math.random() - 0.48) * (baseValue * 0.01); // ±1% with slight upward bias
    const newValue = Math.max(lastValue + change, baseValue * 0.8);

    const newData = [
        ...existingData,
        {
            timestamp: now,
            value: newValue,
        },
    ];

    // Keep last 50 points
    return newData.slice(-50);
}
