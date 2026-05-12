# ==================================================================================
# ROUTER: REFERRAL SYSTEM
# Purpose: Manages referral code validation, statistics, and history.
# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models import models, schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/referral", tags=["Referral"])

@router.get("/info", response_model=schemas.ReferralInfo)
async def get_referral_info(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns the user's referral stats and history.
    """
    history = db.query(models.ReferralHistory).filter(
        models.ReferralHistory.referrer_id == current_user.id
    ).all()
    
    total_earned = sum(h.days_earned for h in history)
    
    return {
        "referral_code": current_user.referral_code,
        "total_referrals": len(history),
        "earned_days": total_earned,
        "history": [{"date": h.created_at, "days": h.days_earned} for h in history]
    }

@router.post("/apply")
async def apply_referral_code(
    data: schemas.ReferralApply,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Applies a referral code to the user's profile before their first purchase.
    """
    if current_user.first_purchase_completed:
        raise HTTPException(status_code=400, detail="Referral code cannot be applied after first purchase.")
        
    if current_user.referred_by:
        raise HTTPException(status_code=400, detail="Referral code already applied.")
        
    # Find the referrer
    referrer = db.query(models.User).filter(models.User.referral_code == data.referral_code).first()
    
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code.")
        
    if referrer.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot use your own referral code.")
        
    current_user.referred_by = data.referral_code
    db.commit()
    
    return {"status": "success", "message": "Referral code applied successfully."}
