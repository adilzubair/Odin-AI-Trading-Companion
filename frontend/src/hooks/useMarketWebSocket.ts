/**
 * Custom React hook for WebSocket connection to real-time market data.
 * Manages connection lifecycle, subscriptions, and price updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PriceUpdate {
    ticker: string;
    price: number;
    bid: number;
    ask: number;
    timestamp: string;
}

interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

interface UseMarketWebSocketOptions {
    tickers: string[];
    onPriceUpdate?: (update: PriceUpdate) => void;
    onError?: (error: string) => void;
    enabled?: boolean;
}

export function useMarketWebSocket({
    tickers,
    onPriceUpdate,
    onError,
    enabled = true
}: UseMarketWebSocketOptions) {
    const ws = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Use refs for callbacks to prevent unnecessary re-connections
    const onPriceUpdateRef = useRef(onPriceUpdate);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onPriceUpdateRef.current = onPriceUpdate;
        onErrorRef.current = onError;
    }, [onPriceUpdate, onError]);

    const connect = useCallback(() => {
        if (!enabled) return;

        try {
            // Get WebSocket URL from environment or default
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/market';

            console.log('[WebSocket] Connecting to:', wsUrl);
            const socket = new WebSocket(wsUrl);
            ws.current = socket;

            socket.onopen = () => {
                console.log('[WebSocket] Connected successfully');
                if (ws.current === socket) {
                    setConnected(true);
                    setError(null);
                    reconnectAttempts.current = 0;
                }

                // Subscribe to tickers if any
                if (tickers.length > 0 && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'subscribe',
                        tickers: tickers
                    }));
                    console.log('[WebSocket] Subscribed to:', tickers);
                }
            };

            socket.onmessage = (event) => {
                if (ws.current !== socket) return;

                try {
                    const message: WebSocketMessage = JSON.parse(event.data);

                    switch (message.type) {
                        case 'connected':
                            console.log('[WebSocket] Welcome message:', message.message);
                            break;

                        case 'subscribed':
                            console.log('[WebSocket] Subscription confirmed:', message.tickers);
                            break;

                        case 'price_update':
                            if (onPriceUpdateRef.current && message.data) {
                                onPriceUpdateRef.current({
                                    ticker: message.ticker,
                                    ...message.data
                                });
                            }
                            break;

                        case 'error':
                            console.error('[WebSocket] Server error:', message.message);
                            setError(message.message);
                            if (onErrorRef.current) onErrorRef.current(message.message);
                            break;

                        default:
                            console.log('[WebSocket] Unknown message type:', message.type);
                    }
                } catch (err) {
                    console.error('[WebSocket] Error parsing message:', err);
                }
            };

            socket.onerror = (event) => {
                if (ws.current !== socket) return;
                console.error('[WebSocket] Connection error:', event);
                setError('Connection error');
                if (onErrorRef.current) onErrorRef.current('WebSocket connection error');
            };

            socket.onclose = (event) => {
                console.log('[WebSocket] Connection closed:', event.code, event.reason);
                if (ws.current === socket) {
                    setConnected(false);
                }

                // Attempt to reconnect if not a normal closure
                if (enabled && reconnectAttempts.current < maxReconnectAttempts && ws.current === socket) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
                    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

                    reconnectTimeout.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                } else if (reconnectAttempts.current >= maxReconnectAttempts) {
                    setError('Max reconnection attempts reached');
                    if (onErrorRef.current) onErrorRef.current('Failed to reconnect to WebSocket');
                }
            };
        } catch (err) {
            console.error('[WebSocket] Failed to create connection:', err);
            setError('Failed to create WebSocket connection');
            if (onErrorRef.current) onErrorRef.current('Failed to create WebSocket connection');
        }
    }, [enabled, tickers.join(',')]);

    // Connect on mount and when enabled/tickers change
    useEffect(() => {
        // Only connect if enabled AND we have tickers to subscribe to
        if (enabled && tickers.length > 0) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                console.log('[WebSocket] Closing connection');
                ws.current.close(1000, 'Component unmounting');
                ws.current = null;
            }
        };
    }, [connect, enabled]);

    // Update subscriptions when tickers change
    useEffect(() => {
        if (connected && ws.current && ws.current.readyState === WebSocket.OPEN && tickers.length > 0) {
            ws.current.send(JSON.stringify({
                type: 'subscribe',
                tickers: tickers
            }));
            console.log('[WebSocket] Updated subscriptions:', tickers);
        }
    }, [connected, tickers.join(',')]);

    return {
        connected,
        error,
        reconnecting: reconnectAttempts.current > 0 && reconnectAttempts.current < maxReconnectAttempts
    };
}
