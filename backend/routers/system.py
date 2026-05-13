from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db, engine
from models import models
from seed_db import seed_data
from core.websocket import manager
import os

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/status")
def get_system_status():
    """Returns the current operational status of the API."""
    return {
        "status": "operational",
        "version": "1.2.0",
        "environment": "production" if os.getenv("PROD") else "development",
        "websocket": "active"
    }

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    """Returns high-level platform statistics."""
    user_count = db.query(models.User).count()
    job_count = db.query(models.Job).count()
    task_count = db.query(models.Task).count()
    return {
        "total_users": user_count,
        "total_jobs": job_count,
        "total_tasks": task_count,
        "active_connections": manager.active_connections_count() if hasattr(manager, 'active_connections_count') else len(manager.active_connections)
    }

@router.post("/reset-db")
def reset_database(db: Session = Depends(get_db)):
    """
    DANGER ZONE: Resets the entire database to the default seed state.
    """
    try:
        # 1. Drop all tables
        models.Base.metadata.drop_all(bind=engine)
        
        # 2. Re-create all tables
        models.Base.metadata.create_all(bind=engine)
        
        # 3. Seed initial data
        seed_data()
        
        return {"message": "Database reset to default seed state successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")
