# ==================================================================================
# REQUESTS ROUTER
# Purpose: Handles invitations and responses for jobs.
# Affected Pages: Frontend -> Projects.jsx (Accepted Jobs Tab), Team.jsx (Send Request Modal)

# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db.database import get_db
from models import models
from routers.auth import get_current_user
from typing import Optional
from core.websocket import manager
from services.notification_service import NotificationService
from services.job_service import job_service
from models.schemas import NotificationResponse, JobRequestCreate

router = APIRouter(prefix="/requests", tags=["Job Requests"])

# --- ENDPOINTS ---

@router.post("/")
async def send_job_request(
    request: JobRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Studio Owner sends an invite to a Photographer.
    Frontend Impact: Triggered from Team.jsx when clicking 'Send Request' on a member.
    Notification Impact: Creates a bell notification for the Photographer.
    Modification Risk: Changing 'redirect_to' will break where the bell takes the user.
    """
    # Create Job Request
    new_request = models.JobRequest(
        job_id=request.job_id,
        sender_id=current_user.id,
        receiver_id=request.receiver_id,
        role=request.role,
        budget=request.budget,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Get job title for notification
    job = db.query(models.Job).filter(models.Job.id == request.job_id).first()
    job_title = job.title if job else "a job"

    # Create notification for receiver (Photographer)
    await NotificationService.create_notification(
        db=db,
        user_id=request.receiver_id,
        title="New Job Invite",
        message=f"{current_user.full_name} has invited you to work on '{job_title}' as {request.role}.",
        notif_type="job_invite",
        reference_id=new_request.id,
        redirect_to="/projects"
 # Leads to Invites tab
    )

    # Notify receiver to refresh their invites/requests page
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "invites"
    }, request.receiver_id)

    return new_request

@router.patch("/{id}")
async def respond_to_job_request(
    id: int,
    status: str = Query(..., pattern="^(accepted|declined)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Photographer accepts or declines an invite.
    Frontend Impact: Triggered by Accept/Decline buttons in Projects.jsx (Invites tab).

    Logic Impact: 
    - If 'accepted': Adds entry to 'assignments' table and moves job out of 'Yet to Assign'.
    - Notifications: Notifies Studio Owner of the response.
    """
    job_request = db.query(models.JobRequest).filter(
        and_(
            models.JobRequest.id == id,
            models.JobRequest.receiver_id == current_user.id
        )
    ).first()

    if not job_request:
        raise HTTPException(status_code=404, detail="Job request not found")

    job_request.status = status
    
    # If accepted, create an assignment
    if status == "accepted":
        assignment = models.Assignment(
            job_id=job_request.job_id,
            member_id=job_request.receiver_id,
            role=job_request.role
        )
        db.add(assignment)
        
        # Update job status - critical for Studio Owner's 'Current' filter
        job = db.query(models.Job).filter(models.Job.id == job_request.job_id).first()
        if job:
            job.status = "assigned"

    db.commit()
    db.refresh(job_request)

    # Notification for Studio Owner
    job_title = job_request.job.title if job_request.job else "job"
    await NotificationService.create_notification(
        db=db,
        user_id=job_request.sender_id,
        title=f"Job Invite {status.capitalize()}",
        message=f"{current_user.full_name} has {status} your invite for '{job_title}'.",
        notif_type="job_invite_response",
        reference_id=job_request.id,
        redirect_to="/projects"

    )

    # Confirmation for Photographer
    sender = db.query(models.User).filter(models.User.id == job_request.sender_id).first()
    sender_name = sender.full_name or sender.username or sender.email if sender else "Studio Owner"
    await NotificationService.create_notification(
        db=db,
        user_id=current_user.id,
        title=f"Job Invite {status.capitalize()}",
        message=f"You have {status} {sender_name}'s invite for '{job_title}'.",
        notif_type="job_invite_response",
        reference_id=job_request.id,
        redirect_to="/projects"

    )

    # Notify Studio Owner to refresh their Job Hub (My Jobs tab)
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "projects"

    }, job_request.sender_id)

    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "projects",
        "message": f"New update on '{job_title}'"
    }, job_request.sender_id)


    return job_request


@router.get("/eligible-jobs/{photographer_id}")
async def get_eligible_jobs(
    photographer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Lists jobs matching photographer's category that aren't already requested.
    Frontend Impact: Populates the dropdown in the 'Send Request' modal.
    """
    photographer = db.query(models.User).filter(models.User.id == photographer_id).first()
    if not photographer:
        raise HTTPException(status_code=404, detail="Photographer not found")
    
    assigned_job_ids = [a.job_id for a in photographer.assignments]
    requested_job_ids = [r.job_id for r in db.query(models.JobRequest).filter(
        and_(
            models.JobRequest.receiver_id == photographer_id,
            models.JobRequest.status == "pending"
        )
    ).all()]
    
    excluded_ids = set(assigned_job_ids + requested_job_ids)

    jobs = db.query(models.Job).filter(
        and_(
            models.Job.user_id == current_user.id,
            models.Job.status == "open",
            # Removed role filter to show all available jobs
            ~models.Job.id.in_(excluded_ids) if excluded_ids else True
        )
    ).all()
    
    return jobs

@router.get("/")
async def get_my_requests(
    role: str = Query("receiver", pattern="^(sender|receiver)$"),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Main feed for requests/invites.
    Frontend Impact: 
    - role=receiver & status=pending -> 'Invites' tab.
    - role=receiver & status=declined -> 'Declined Projects' tab.

    """
    query = db.query(models.JobRequest)
    if role == "sender":
        query = query.filter(models.JobRequest.sender_id == current_user.id)
    else:
        query = query.filter(models.JobRequest.receiver_id == current_user.id)
    
    if status:
        query = query.filter(models.JobRequest.status == status)
    
    requests = query.order_by(models.JobRequest.created_at.desc()).all()
    
    result = []
    for req in requests:
        job = db.query(models.Job).filter(models.Job.id == req.job_id).first()
        sender = db.query(models.User).filter(models.User.id == req.sender_id).first()
        receiver = db.query(models.User).filter(models.User.id == req.receiver_id).first()
        
        result.append({
            "request_id": req.id, # Explicitly named as request_id
            "job_id": req.job_id,
            "job_title": job.title if job else "Unknown Job",
            "job_date": job.date if job else None,
            "sender_user_id": req.sender_id, # sender_id is a user_id
            "sender_name": sender.full_name or sender.username or "Unknown",
            "receiver_user_id": req.receiver_id, # receiver_id is a user_id
            "receiver_name": receiver.full_name or receiver.username or "Unknown",
            "role": req.role,
            "budget": req.budget,
            "status": req.status,
            "created_at": req.created_at
        })
    # Sort chronologically by the job's date (if available)
    return job_service.sort_chronologically(result, date_key='job_date')


@router.delete("/{id}")
async def cancel_job_request(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Studio Owner cancels a pending job request.
    """
    request = db.query(models.JobRequest).filter(
        and_(models.JobRequest.id == id, models.JobRequest.sender_id == current_user.id)
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
    
    db.delete(request)
    db.commit()
    return {"message": "Request cancelled successfully"}

@router.get("/job/{job_id}")
async def get_requests_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches all invitations/requests for a specific job.
    Frontend Impact: Populates the 'Request Status' popup in Projects.jsx.

    """
    # Verify ownership
    job = db.query(models.Job).filter(and_(models.Job.id == job_id, models.Job.user_id == current_user.id)).first()
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized to view this job's requests")

    requests = db.query(models.JobRequest).filter(models.JobRequest.job_id == job_id).all()
    
    result = []
    for req in requests:
        receiver = db.query(models.User).filter(models.User.id == req.receiver_id).first()
        result.append({
            "request_id": req.id,
            "receiver_name": receiver.full_name or receiver.username or "Unknown",
            "receiver_user_id": req.receiver_id,
            "role": req.role,
            "status": req.status,
            "created_at": req.created_at
        })
    return result

@router.get("/accepted-jobs")
async def get_accepted_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns jobs assigned to the current Photographer.
    Frontend Impact: Populates the 'Accepted Projects' sub-tab in Projects.jsx.

    """
    assignments = db.query(models.Assignment).filter(models.Assignment.member_id == current_user.id).all()
    
    result = []
    for assign in assignments:
        job = db.query(models.Job).filter(models.Job.id == assign.job_id).first()
        owner = db.query(models.User).filter(models.User.id == job.user_id).first() if job else None
        
        result.append({
            "assignment_id": assign.id,
            "job_id": assign.job_id,
            "title": job.title if job else "Unknown Job",
            "owner_user_id": owner.id if owner else None,
            "owner_name": owner.full_name or owner.username or "Unknown",
            "date": job.date if job else None,
            "role": assign.role,
            "status": job.status if job else "unknown"
        })
    # Sort chronologically by job date (Upcoming first)

