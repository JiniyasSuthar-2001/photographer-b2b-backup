from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.database import get_db
from routers.auth import get_current_user
from models import models
from sqlalchemy import and_, or_
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_summary(
    role: str = Query("photographer"),

    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns data for the dashboard based on active role.
    """
    now = datetime.utcnow()
    next_week = now + timedelta(days=7)

    # Common: Next Week Work (Jobs from BOTH roles)
    # 1. Owned Jobs
    owned_jobs = db.query(models.Job).filter(
        and_(models.Job.user_id == current_user.id, models.Job.date >= now, models.Job.date <= next_week)
    ).all()
    
    # 2. Accepted Assignments
    accepted_assignments = db.query(models.Job).join(models.JobRequest).filter(
        and_(models.JobRequest.receiver_id == current_user.id, models.JobRequest.status == 'accepted', models.Job.date >= now, models.Job.date <= next_week)
    ).all()
    
    next_week_work = owned_jobs + accepted_assignments
    
    # Role-specific latest items
    if role == 'studio_owner':
        latest_items = db.query(models.Job).filter(
            models.Job.user_id == current_user.id
        ).order_by(models.Job.date.desc()).limit(4).all()
    else:
        latest_items = db.query(models.JobRequest).filter(
            models.JobRequest.receiver_id == current_user.id
        ).order_by(models.JobRequest.created_at.desc()).limit(4).all()

    return {
        "next_week_work": next_week_work,
        "latest_items": latest_items,
        "role": role
    }
