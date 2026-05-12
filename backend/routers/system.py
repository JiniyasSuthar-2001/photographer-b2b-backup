from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db, engine
from models import models
from seed_db import seed_data
import os

router = APIRouter(prefix="/system", tags=["System"])

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
