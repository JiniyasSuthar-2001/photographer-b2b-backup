# ==================================================================================
# SERVICE: AUTHENTICATION
# Purpose: Core security logic for passwords, JWT tokens, and user sessions.
# Connected Routers: backend/routers/auth.py
# Impact: Every secure endpoint in the API depends on get_current_user logic here.
# ==================================================================================

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.models import User, IdentityOwnership
from models.schemas import UserLogin, UserSignUp
from core.config import settings
from .demo_service import demo_service
import random
import string


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

HARDCODED_USERS = {
    "admin": "admin@001",
    "admin01": "admin@002",
    "admin02": "admin003",
}

class AuthService:
    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def authenticate_user(db: Session, user_data: UserLogin):
        # Check hardcoded users first
        if user_data.username in HARDCODED_USERS:
            if HARDCODED_USERS[user_data.username] == user_data.password:
                # Get or create the user in DB so relationships work
                user = db.query(User).filter(User.username == user_data.username).first()
                if not user:
                    user = User(
                        username=user_data.username,
                        hashed_password=AuthService.get_password_hash(user_data.password),
                        full_name="System Admin" if user_data.username == "admin" else user_data.username.capitalize(),
                        user_type="photographer",
                        phone=f"000{list(HARDCODED_USERS.keys()).index(user_data.username)}", # Dummy phone
                        referral_code=AuthService.generate_referral_code()
                    )

                    db.add(user)
                    db.commit()
                    db.refresh(user)
                
                # SEED DEMO DATA for Admin
                demo_service.seed_admin_data(db, user.id)
                
                return user
        
        user = db.query(User).filter(User.username == user_data.username).first()
        if not user:
            return False
        if not AuthService.verify_password(user_data.password, user.hashed_password):
            return False
        return user

    @staticmethod
    def generate_referral_code(length=8):
        chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return ''.join(random.choice(chars) for _ in range(length))

    @staticmethod
    def create_user(db: Session, user_data: UserSignUp):
        # 1. Identity Ownership Check (Abuse Protection)
        # Check if phone is already owned by another USER ID
        existing_phone_owner = db.query(IdentityOwnership).filter(
            IdentityOwnership.identity_type == "phone",
            IdentityOwnership.identity_value == user_data.phone
        ).first()
        
        if existing_phone_owner:
            # Check if this owner is still active as a different user
            owner_user = db.query(User).filter(User.id == existing_phone_owner.user_id).first()
            if owner_user and owner_user.username != user_data.username:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="This phone number belongs to another user ID.")

        # 1b. Check if username or phone already exists in User table
        if db.query(User).filter(User.username == user_data.username).first():
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Username already exists")
            
        if db.query(User).filter(User.phone == user_data.phone).first():
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Phone number already registered")

        hashed_password = AuthService.get_password_hash(user_data.password)
        
        # 2. Generate Unique Referral Code
        unique_code = AuthService.generate_referral_code()
        while db.query(User).filter(User.referral_code == unique_code).first():
            unique_code = AuthService.generate_referral_code()

        db_user = User(
            username=user_data.username,
            hashed_password=hashed_password,
            phone=user_data.phone,
            full_name=user_data.full_name,
            city=user_data.city,
            category=user_data.category,
            user_type=user_data.user_type,
            referral_code=unique_code,
            referred_by=user_data.referral_code_applied,
            subscription_expiry=datetime.utcnow() + timedelta(days=14) # Default trial
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # 3. Register Identity Ownership
        if not existing_phone_owner:
            new_ownership = IdentityOwnership(
                user_id=db_user.id,
                identity_type="phone",
                identity_value=user_data.phone
            )
            db.add(new_ownership)
            db.commit()

        return db_user

    @staticmethod
    def get_current_user(db: Session, token: str):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                print(f"[AUTH ERROR] Token payload missing 'sub' claim")
                return None
        except JWTError as e:
            print(f"[AUTH ERROR] JWT Decode Error: {str(e)} (Key used: {settings.SECRET_KEY[:5]}...)")
            return None
        except Exception as e:
            print(f"[AUTH ERROR] Unexpected Auth Error: {str(e)}")
            return None

        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"[AUTH ERROR] User '{username}' found in token but not in database")
        return user


auth_service = AuthService()
