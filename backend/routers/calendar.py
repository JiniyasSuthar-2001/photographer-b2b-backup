from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db.database import get_db
from models import models
from models.models import User, Assignment, Job
from routers.auth import get_current_user
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime
from core.websocket import manager

router = APIRouter(prefix="/calendar", tags=["Calendar"])

class AvailabilityToggle(BaseModel):
    date: str
    status: str # Booked, Partial, Blocked

@router.get("/roster")
async def get_daily_roster(
    date: str, # Format: YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Get the daily roster (assignments and owned jobs) for a specific date.
    """
    # 1. Manual Overrides
    availability = db.query(models.Availability).filter(
        models.Availability.user_id == current_user.id,
        models.Availability.date == date
    ).first()
    
    # 2. Owned Jobs for this date
    owned_jobs = db.query(models.Job).filter(
        models.Job.user_id == current_user.id,
        func.date(models.Job.date) == date
    ).all()
    
    # 3. Accepted Assignments for this date
    assignments = db.query(models.Job).join(models.Assignment).filter(
        models.Assignment.member_id == current_user.id,
        func.date(models.Job.date) == date
    ).all()
    
    return {
        "date": date,
        "status": availability.status if availability else "Available",
        "owned_jobs": [{"id": j.id, "title": j.title, "time": j.date.strftime("%H:%M") if j.date else "00:00"} for j in owned_jobs],
        "assignments": [{"id": j.id, "title": j.title, "time": j.date.strftime("%H:%M") if j.date else "00:00"} for j in assignments]
    }

@router.post("/availability")
async def toggle_availability(
    request: AvailabilityToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Toggle availability for a specific date (Booked, Partial, Blocked).
    """
    availability = db.query(models.Availability).filter(
        models.Availability.user_id == current_user.id,
        models.Availability.date == request.date
    ).first()
    
    if availability:
        availability.status = request.status
    else:
        availability = models.Availability(
            user_id=current_user.id,
            date=request.date,
            status=request.status
        )
        db.add(availability)
    
    db.commit()
    
    # WebSocket Refresh
    await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "calendar"}, current_user.id)
    
    return {"message": "Availability updated", "date": request.date, "status": request.status}
