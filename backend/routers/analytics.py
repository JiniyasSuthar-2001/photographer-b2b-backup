from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.database import get_db
from routers.auth import get_current_user
from services.analytics_service import analytics_service
from models import models

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/")
async def get_analytics(
    role: str = Query("studio_owner"),
    timeframe: str = Query("1M"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Returns aggregated KPI data."""
    internal_role = 'photographer' if role == 'photographer' else 'freelancer'
    return analytics_service.get_role_analytics(db, current_user.id, internal_role, timeframe)

@router.get("/trends")
async def get_analytics_trends(
    timeframe: str = Query("1M"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Returns revenue/job trends over time."""
    return analytics_service.get_revenue_trends(db, current_user.id, timeframe)

@router.get("/categories")
async def get_category_distribution(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Returns job category distribution for the user."""
    return analytics_service.get_category_stats(db, current_user.id)

@router.get("/rankings")
async def get_photographer_rankings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Returns top collaborators."""
    return analytics_service.get_top_photographers(db, current_user.id)
