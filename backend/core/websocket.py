from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    """
    Manages active WebSocket connections to provide real-time updates.
    Properly connects 'Users' (backends actions) to 'Pages' (frontend state).
    """
    def __init__(self):
        # Maps user_id -> List of active WebSockets (a user might have multiple tabs open)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        """Sends a real-time event to all active 'Pages' of a specific 'User'."""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(json.dumps(message))

    async def send_toast(self, message: str, toast_type: str, user_id: int):
        """Sends a real-time toast notification to a specific user."""
        await self.send_personal_message({
            "type": "TOAST",
            "message": message,
            "toastType": toast_type
        }, user_id)

    async def broadcast(self, message: dict):
        """Broadcasts an event to every connected page across the whole platform."""
        for user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()
