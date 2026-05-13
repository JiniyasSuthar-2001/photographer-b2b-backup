# ==================================================================================
# NOTIFICATIONS ROUTER
# Purpose: Powers the real-time alert system and unread badges.
# Affected Pages: Frontend -> NotificationBell.jsx (TopBar)
# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db.database import get_db
from models import models
from models.schemas import NotificationResponse, NotificationUpdate
from routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# --- ENDPOINTS ---

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches the user's notification history.
    Frontend Impact: Populates the dropdown list in the NotificationBell.
    Polling: NotificationBell.jsx calls this every 30 seconds to refresh the list.
    """
    from datetime import datetime, timedelta
    offset = (page - 1) * limit
    notifications = db.query(models.Notification).\
        filter(models.Notification.user_id == current_user.id).\
        order_by(models.Notification.created_at.desc()).\
        offset(offset).limit(limit).all()
    
    return notifications

@router.patch("/{id}/read", response_model=NotificationResponse)
async def mark_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Marks a single notification as read.
    Frontend Impact: Triggered when a user clicks a notification item in the bell dropdown.
    Visual Impact: Removes the 'unread' highlight and reduces the badge count in the navbar.
    """
    notification = db.query(models.Notification).filter(
        and_(
            models.Notification.id == id,
            models.Notification.user_id == current_user.id
        )
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.patch("/read-all")
async def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Marks all notifications for the user as read.
    Frontend Impact: Triggered by the 'Mark all as read' link in the bell dropdown.
    """
    db.query(models.Notification).filter(
        and_(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False
        )
    ).update({"is_read": True})
    
    db.commit()
    return {"message": "All notifications marked as read"}
