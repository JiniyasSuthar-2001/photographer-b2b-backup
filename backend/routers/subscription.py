# ==================================================================================
# ROUTER: SUBSCRIPTION & BILLING
# Purpose: Manages user plans, trial periods, payments, and referral rewards.
# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models import models, schemas
from routers.auth import get_current_user
from core.websocket import manager
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/subscription", tags=["Subscription"])

@router.get("/status", response_model=schemas.SubscriptionStatus)
async def get_subscription_status(current_user: models.User = Depends(get_current_user)):
    """
    Returns the current user's subscription details.
    """
    now = datetime.utcnow()
    expiry = current_user.subscription_expiry
    
    days_left = 0
    if expiry and expiry > now:
        days_left = (expiry - now).days

    return {
        "plan": current_user.plan,
        "is_pro": current_user.is_pro,
        "expiry_date": expiry,
        "days_left": days_left
    }

@router.post("/purchase")
async def purchase_plan(
    payment_data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Simulates a payment purchase.
    Triggers referral rewards if it's the FIRST successful paid purchase.
    """
    # 1. Simulate Payment Success
    transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    
    new_payment = models.Payment(
        user_id=current_user.id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        status="success",
        transaction_id=transaction_id
    )
    db.add(new_payment)
    
    # 2. Update User Subscription
    is_first_purchase = not current_user.first_purchase_completed
    
    # Logic for expiry
    now = datetime.utcnow()
    if current_user.subscription_expiry and current_user.subscription_expiry > now:
        new_expiry = current_user.subscription_expiry + timedelta(days=30)
    else:
        new_expiry = now + timedelta(days=30)
        
    current_user.plan = payment_data.plan_name
    current_user.is_pro = True
    current_user.subscription_expiry = new_expiry
    
    # 3. Handle Referral Reward (ONLY if first purchase)
    reward_given = False
    if is_first_purchase and current_user.referred_by:
        referrer = db.query(models.User).filter(models.User.referral_code == current_user.referred_by).first()
        
        # Self-referral prevention (double check)
        if referrer and referrer.id != current_user.id:
            # Extend referrer's subscription by 15 days
            if referrer.subscription_expiry and referrer.subscription_expiry > now:
                referrer.subscription_expiry += timedelta(days=15)
            else:
                referrer.subscription_expiry = now + timedelta(days=15)
            
            # Log referral history
            ref_history = models.ReferralHistory(
                referrer_id=referrer.id,
                referred_user_id=current_user.id,
                days_earned=15
            )
            db.add(ref_history)
            reward_given = True
            
            # WebSocket Notification for Referrer
            await manager.send_personal_message({
                "type": "referral_reward_received",
                "days_added": 15,
                "new_expiry_date": referrer.subscription_expiry.isoformat(),
                "message": f"You earned 15 days of Pro because of a successful referral!"
            }, referrer.id)

    current_user.first_purchase_completed = True
    
    # 4. Log Subscription History
    history = models.SubscriptionHistory(
        user_id=current_user.id,
        plan=payment_data.plan_name,
        start_date=now,
        end_date=new_expiry
    )
    db.add(history)
    
    db.commit()
    
    # 5. WebSocket Notification for Current User
    await manager.send_personal_message({
        "type": "payment_success",
        "plan": current_user.plan,
        "new_expiry": current_user.subscription_expiry.isoformat()
    }, current_user.id)
    
    return {
        "status": "success",
        "transaction_id": transaction_id,
        "new_expiry": current_user.subscription_expiry,
        "reward_given": reward_given
    }
