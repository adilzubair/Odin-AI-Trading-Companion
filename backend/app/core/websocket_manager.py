"""
WebSocket Connection Manager for real-time market data streaming.
Manages client connections, subscriptions, and broadcasts price updates.
"""

from fastapi import WebSocket
from typing import Dict, Set
import logging
import json

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and subscriptions for market data."""
    
    def __init__(self):
        # Map of client_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of websocket -> set of subscribed tickers
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        
        self.active_connections[client_id].add(websocket)
        self.subscriptions[websocket] = set()
        
        logger.info(f"Client {client_id} connected. Total connections: {self.get_connection_count()}")
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            self.active_connections[client_id].discard(websocket)
            
            # Clean up empty client entries
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
        
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        
        logger.info(f"Client {client_id} disconnected. Total connections: {self.get_connection_count()}")
    
    def subscribe(self, websocket: WebSocket, tickers: list[str]):
        """Subscribe a WebSocket to specific tickers."""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].update(tickers)
            logger.debug(f"Subscribed to {tickers}. Total subscriptions: {len(self.subscriptions[websocket])}")
    
    def unsubscribe(self, websocket: WebSocket, tickers: list[str]):
        """Unsubscribe a WebSocket from specific tickers."""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].difference_update(tickers)
            logger.debug(f"Unsubscribed from {tickers}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            # Downgrade to warning as client might have disconnected
            logger.warning(f"Error sending personal message: {e}")
    
    async def broadcast_price_update(self, ticker: str, data: dict):
        """Broadcast price update to all subscribers of a ticker."""
        message = {
            "type": "price_update",
            "ticker": ticker,
            "data": data
        }
        
        disconnected = []
        
        # Iterate over a copy of the items to avoid RuntimeError if subscriptions change
        for ws, subscribed_tickers in list(self.subscriptions.items()):
            if ticker in subscribed_tickers:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    # Use debug level to avoid spam - disconnected clients are normal
                    logger.debug(f"Error broadcasting to client: {e}")
                    disconnected.append(ws)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            # Find client_id for this websocket
            for client_id, ws_set in self.active_connections.items():
                if ws in ws_set:
                    self.disconnect(ws, client_id)
                    break
    
    def get_all_subscribed_tickers(self) -> Set[str]:
        """Get all tickers that at least one client is subscribed to."""
        all_tickers = set()
        for subscribed in self.subscriptions.values():
            all_tickers.update(subscribed)
        return all_tickers
    
    def get_connection_count(self) -> int:
        """Get total number of active connections."""
        return sum(len(ws_set) for ws_set in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()
