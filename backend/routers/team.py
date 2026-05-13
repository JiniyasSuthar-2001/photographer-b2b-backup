# ==================================================================================
# TEAM ROUTER
# Purpose: Manages the Studio Owner's photographer directory and work history.
# Affected Pages: Frontend -> Team.jsx, Projects.jsx (CollaborationModal)

# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db.database import get_db
from models import models
from models.schemas import CollaborationResponse, UserSearchResponse, TeamRequestCreate, TeamRequestResponse, TeamMemberUpdate
from routers.auth import get_current_user
from services.notification_service import NotificationService
from core.websocket import manager
from typing import Optional
import math
from services.team_service import team_service

router = APIRouter(prefix="/team", tags=["Team"])

# --- ENDPOINTS ---

@router.get("/collaborations/{member_id}", response_model=CollaborationResponse)
async def get_collaborations(
    member_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches past jobs shared between the Studio Owner and a specific Photographer.
    Frontend Impact: Populates the list inside CollaborationModal in Projects.jsx.

    Modification Risk: If pagination logic changes, the modal's 'Next/Prev' buttons 
    may stop functioning.
    """
    # Only return jobs where member_id = selected photographer AND job belongs to logged-in user
    query = db.query(models.Job, models.Assignment.role).\
        join(models.Assignment, models.Job.id == models.Assignment.job_id).\
        filter(models.Job.user_id == current_user.id).\
        filter(models.Assignment.member_id == member_id).\
        order_by(models.Job.date.desc())

    total_count = query.count()
    total_pages = math.ceil(total_count / limit)
    
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    data = []
    for job, role in results:
        data.append({
            "job_id": job.id, # The unique ID of the job
            "title": job.title,
            "date": job.date,
            "role": role,
            "status": job.status,
            "owner_user_id": job.user_id # user_id of the owner
        })

    return {
        "data": data,
        "page": page,
        "total_pages": total_pages
    }

@router.get("/search", response_model=UserSearchResponse)
async def search_photographer(
    phone: Optional[str] = None, 
    email: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    """
    Search for a registered photographer by phone number or email.
    Frontend Impact: Triggered in Team.jsx when adding a 'Connected' member.
    """
    if not phone and not email:
        raise HTTPException(status_code=400, detail="Must provide either phone or email")
    
    query = db.query(models.User)
    if phone:
        user = query.filter(models.User.phone == phone).first()
    else:
        user = query.filter(models.User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "full_name": user.full_name or user.username or user.email,
        "city": user.city,
        "email": user.email,
        "phone": user.phone,
        "category": user.category
    }

@router.post("/request", response_model=TeamRequestResponse)
async def send_team_request(
    request: TeamRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Sends a request for a photographer to join the Studio Owner's directory.
    Frontend Impact: Updates the UI state in Team.jsx after successfully adding a member.
    Notification Impact: Alerts the Photographer via the NotificationBell.
    """
    # Find receiver by phone
    receiver = db.query(models.User).filter(models.User.phone == request.phone).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Photographer with this phone number not found")

    # Check if request already exists
    existing = db.query(models.TeamRequest).filter(
        and_(
            models.TeamRequest.sender_id == current_user.id,
            models.TeamRequest.receiver_id == receiver.id,
            models.TeamRequest.status == "pending"
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Request already pending")

    # Check if already in team
    in_team = db.query(models.Team).filter(
        and_(models.Team.owner_id == current_user.id, models.Team.member_id == receiver.id)
    ).first()
    if in_team:
        raise HTTPException(status_code=400, detail="This user is already in your team")

    new_request = models.TeamRequest(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        status="pending",
        display_name=request.display_name,
        display_category=request.display_category,
        display_city=request.display_city
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Create notification for receiver
    await NotificationService.create_notification(
        db=db,
        user_id=receiver.id,
        title="Team Invitation",
        message=f"{current_user.full_name or current_user.username} has invited you to join their team.",
        notif_type="team_request",
        reference_id=new_request.id,
        redirect_to="/team" # Handled by Bell
    )

    # Notify photographer to refresh their team requests
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "team"
    }, receiver.id)

    return new_request

@router.patch("/request/{id}", response_model=TeamRequestResponse)
async def respond_to_request(
    id: int,
    status: str = Query(..., pattern="^(accepted|declined)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Handles photographer's response to a team invite.
    Impact: If 'accepted', the photographer is added to the 'team' table 
    and becomes visible in the Studio Owner's Team.jsx list.
    """
    team_request = db.query(models.TeamRequest).filter(
        and_(
            models.TeamRequest.id == id,
            models.TeamRequest.receiver_id == current_user.id
        )
    ).first()

    if not team_request:
        raise HTTPException(status_code=404, detail="Request not found")

    team_request.status = status
    
    if status == "accepted":
        # TEAM LOCKING REMOVED: Users can now join multiple teams.

        # Add to team table with custom display info

        new_team_member = models.Team(
            owner_id=team_request.sender_id,
            member_id=team_request.receiver_id,
            display_name=team_request.display_name,
            display_category=team_request.display_category,
            display_city=team_request.display_city,
            phone=current_user.phone
        )
        db.add(new_team_member)
    
    db.commit()
    db.refresh(team_request)

    # Notify Studio Owner
    await NotificationService.create_notification(
        db=db,
        user_id=team_request.sender_id,
        title=f"Team Request {status.capitalize()}",
        message=f"{current_user.full_name or current_user.username} has {status} your invitation to join the team.",
        notif_type="team_request_response",
        reference_id=team_request.id,
        redirect_to="/team"
    )

    # Notify Photographer (Confirmation)
    sender_name = (db.query(models.User).filter(models.User.id == team_request.sender_id).first().full_name) or "Photographer"
    await NotificationService.create_notification(
        db=db,
        user_id=current_user.id,
        title=f"Team Request {status.capitalize()}",
        message=f"You have {status} {sender_name}'s invitation to join their team.",
        notif_type="team_request_response",
        reference_id=team_request.id,
        redirect_to="/team"
    )

    # Notify Studio Owner that team changed
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "team"
    }, team_request.sender_id)

    return team_request

@router.get("/requests/pending")
async def get_pending_team_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches team invitations sent TO the current user.
    """
    requests = db.query(models.TeamRequest).filter(
        and_(models.TeamRequest.receiver_id == current_user.id, models.TeamRequest.status == "pending")
    ).all()
    
    data = []
    for r in requests:
        sender = db.query(models.User).filter(models.User.id == r.sender_id).first()
        data.append({
            "request_id": r.id,
            "sender_user_id": r.sender_id,
            "sender_name": sender.full_name or sender.username,
            "sender_phone": sender.phone,
            "sender_email": sender.email,
            "display_name": r.display_name,
            "display_category": r.display_category,
            "display_city": r.display_city,
            "created_at": r.created_at
        })
    return data

@router.get("/joined")
async def get_joined_teams(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches teams that the current user is a member of.
    """
    joined = db.query(models.Team).filter(models.Team.member_id == current_user.id).all()
    
    data = []
    for entry in joined:
        owner = db.query(models.User).filter(models.User.id == entry.owner_id).first()
        data.append({
            "team_entry_id": entry.id,
            "owner_user_id": owner.id,
            "owner_name": owner.full_name or owner.username,
            "owner_phone": owner.phone,
            "owner_email": owner.email,
            "display_name": entry.display_name,
            "display_category": entry.display_category,
            "display_city": entry.display_city
        })
    return data

@router.get("/")
async def get_team(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches the full team directory for a Studio Owner.
    Frontend Impact: Populates the table in Team.jsx.
    """
    return team_service.get_team_directory(db, current_user.id)

@router.patch("/{member_id}")
async def update_team_member(
    member_id: int,
    update: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Allows Studio Owners to edit the 'Alias' information for a team member.
    Frontend Impact: Triggered by 'Edit' action in Team.jsx.
    Note: This does NOT change the Photographer's actual profile, only their 
    entry in the owner's directory.
    """
    entry = db.query(models.Team).filter(
        and_(models.Team.owner_id == current_user.id, models.Team.member_id == member_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Team member not found")

    if update.display_name: entry.display_name = update.display_name
    if update.display_category: entry.display_category = update.display_category
    if update.display_city: entry.display_city = update.display_city

    db.commit()
    return {"message": "Updated successfully"}

@router.delete("/{member_id}")
async def remove_team_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Removes a photographer from the Studio Owner's local directory.
    Frontend Impact: Triggered by 'Delete' action in Team.jsx.
    """
    entry = db.query(models.Team).filter(
        and_(models.Team.owner_id == current_user.id, models.Team.member_id == member_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Team member not found")

    db.delete(entry)
    db.commit()
    
    # WebSocket Refresh for the member to update their 'Joined Teams' list
    await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "team"}, member_id)
    
    return {"message": "Removed successfully"}

@router.get("/discover")
async def discover_photographers(
    category: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Public directory of registered freelancers.
    Frontend Impact: Populates the 'Discover' tab in Team.jsx.
    """
    # Any user can be discovered regardless of their initial user_type
    query = db.query(models.User)

    
    if category:
        query = query.filter(models.User.category.ilike(f"%{category}%"))
    if city:
        query = query.filter(models.User.city.ilike(f"%{city}%"))
    
    # Exclude users already in the team
    team_ids = [t.member_id for t in db.query(models.Team).filter(models.Team.owner_id == current_user.id).all()]
    if team_ids:
        query = query.filter(~models.User.id.in_(team_ids))
    
    photographers = query.limit(50).all()
    
    return [{
        "user_id": p.id, # id is user_id here
        "name": p.full_name or p.username or p.email,
        "city": p.city,
        "category": p.category,
        "phone": p.phone,
        "is_registered": True
    } for p in photographers]
