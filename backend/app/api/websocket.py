"""
WebSocket endpoint for real-time market data streaming.
Clients can subscribe to specific tickers and receive live price updates.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import manager
import logging
import json

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/market")
async def market_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time market data.
    
    Client Messages:
    - {"type": "subscribe", "tickers": ["AAPL", "NVDA", ...]}
    - {"type": "unsubscribe", "tickers": ["AAPL"]}
    - {"type": "ping"}
    
    Server Messages:
    - {"type": "subscribed", "tickers": [...]}
    - {"type": "price_update", "ticker": "AAPL", "data": {...}}
    - {"type": "pong"}
    - {"type": "error", "message": "..."}
    """
    # Generate client ID from connection headers
    client_id = websocket.headers.get("sec-websocket-key", "unknown")
    
    try:
        # Accept connection
        await manager.connect(websocket, client_id)
        
        # Send welcome message
        await manager.send_personal_message({
            "type": "connected",
            "message": "WebSocket connected successfully",
            "client_id": client_id
        }, websocket)
        
        # Listen for messages from client
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_json()
                message_type = data.get("type")
                
                if message_type == "subscribe":
                    # Client wants to subscribe to tickers
                    tickers = data.get("tickers", [])
                    if tickers:
                        manager.subscribe(websocket, tickers)
                        await manager.send_personal_message({
                            "type": "subscribed",
                            "tickers": tickers,
                            "message": f"Subscribed to {len(tickers)} ticker(s)"
                        }, websocket)
                        logger.info(f"Client {client_id} subscribed to {tickers}")
                
                elif message_type == "unsubscribe":
                    # Client wants to unsubscribe from tickers
                    tickers = data.get("tickers", [])
                    if tickers:
                        manager.unsubscribe(websocket, tickers)
                        await manager.send_personal_message({
                            "type": "unsubscribed",
                            "tickers": tickers
                        }, websocket)
                        logger.info(f"Client {client_id} unsubscribed from {tickers}")
                
                elif message_type == "ping":
                    # Heartbeat ping
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": data.get("timestamp")
                    }, websocket)
                
                else:
                    # Unknown message type
                    await manager.send_personal_message({
                        "type": "error",
                        "message": f"Unknown message type: {message_type}"
                    }, websocket)
            
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
            
            except Exception as e:
                logger.error(f"Error processing message from {client_id}: {e}")
                # Don't try to send error back if connection is broken, just break
                break
    
    except WebSocketDisconnect as e:
        if e.code in [1000, 1001]:
            logger.info(f"Client {client_id} disconnected normally ({e.code})")
        else:
            logger.warning(f"Client {client_id} disconnected with code {e.code}")
        manager.disconnect(websocket, client_id)
    
    except Exception as e:
        # Check if it's a "Component unmounting" error which comes as a tuple or similar
        error_str = str(e)
        if "Component unmounting" in error_str or "1000" in error_str:
             logger.info(f"Client {client_id} disconnected (component unmounting)")
        else:
             logger.error(f"WebSocket error for client {client_id}: {e}")
        manager.disconnect(websocket, client_id)
