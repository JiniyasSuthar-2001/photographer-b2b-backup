from sqlalchemy.orm import Session
from models.models import Notification
from core.websocket import manager
from datetime import datetime

class NotificationService:
    @staticmethod
    async def create_notification(
        db: Session, 
        user_id: int, 
        title: str, 
        message: str, 
        notif_type: str, 
        reference_id: int = None,
        redirect_to: str = "/"
    ):
        """
        Creates a persistent notification in DB and broadcasts it via WebSocket.
        """
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            reference_id=reference_id,
            redirect_to=redirect_to,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)

        # Broadcast via WebSocket
        await manager.send_personal_message({
            "type": "NEW_NOTIFICATION",
            "data": {
                "id": notif.id,
                "title": notif.title,
                "message": notif.message,
                "type": notif.type,
                "reference_id": notif.reference_id,
                "redirect_to": notif.redirect_to,
                "is_read": False,
                "created_at": notif.created_at.isoformat()
            }
        }, user_id)

        # Also show a real-time toast
        await manager.send_toast(message, "info", user_id)

        return notif

notification_service = NotificationService()
