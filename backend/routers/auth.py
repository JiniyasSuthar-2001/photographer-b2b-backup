# ==================================================================================
# AUTHENTICATION ROUTER
# Purpose: Manages user access, session tokens, and route protection.
# Affected Pages: Frontend -> Login.jsx, Signup.jsx, ProtectedRoutes
# ==================================================================================

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schemas import UserLogin, UserSignUp, Token, ForgotPassword, UserProfile, UserProfileUpdate
from models import models
from services.auth_service import auth_service
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- SECURITY CONFIG ---
# This scheme allows the backend to extract the JWT from the Authorization header.
# Frontend Impact: Every request from api.js must include 'Bearer <token>'.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Dependency to protect routes. 
    Impact: If a token is invalid or expired, the frontend receives a 401 status
    and should redirect the user to the login page.
    """
    user = auth_service.get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return user

# --- ENDPOINTS ---

@router.post("/signup")
async def signup(user_data: UserSignUp, db: Session = Depends(get_db)):
    """
    Creates a new user record.
    Frontend Impact: Triggered by the form in Signup.jsx.
    """
    try:
        # Validate confirm_password if provided
        if user_data.confirm_password is not None and user_data.password != user_data.confirm_password:
            raise HTTPException(status_code=400, detail="Password and confirm_password do not match")

        # Check if username exists directly
        existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Check if email exists directly
        existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email address already registered")

        # Check if phone exists and reject if owned by another user
        if user_data.phone:
            existing_phone = db.query(models.User).filter(models.User.phone == user_data.phone).first()
            if existing_phone:
                raise HTTPException(status_code=400, detail="Phone number already registered")

        user = auth_service.create_user(db, user_data)
        # Build response with profile info so frontend can redirect to Profile
        return {"message": "User created successfully", "user": {"username": user.username, "email": user.email, "phone": user.phone, "full_name": user.full_name}}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user and returns a JWT token.
    Frontend Impact: Populates 'token' and 'user' in localStorage.
    Modification Risk: If the response structure changes, authService.login in api.js 
    will fail to save the token correctly.
    """
    user = auth_service.authenticate_user(db, user_data)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """
    Logs out user.
    """
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    """
    Simulates a password reset request.
    Frontend Impact: Connected to the 'Forgot Password' link in Login.jsx.
    """
    return {"message": f"Password reset instructions sent to user {data.username}"}

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: models.User = Depends(get_current_user)):
    """
    Returns the profile of the current authenticated user.
    """
    return current_user

@router.put("/profile", response_model=UserProfile)
async def update_profile(
    profile_data: UserProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Updates current user's profile information.
    """
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.city is not None:
        current_user.city = profile_data.city
    if profile_data.category is not None:
        current_user.category = profile_data.category
    
    db.commit()
    db.refresh(current_user)
    return current_user
