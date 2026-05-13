# PROJECTS ROUTER
# Purpose: Manages project creation and retrieval for Studio Owners.
# Affected Pages: Frontend -> Projects.jsx (My Projects tab)

# ==================================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models import models
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
from core.websocket import manager
from typing import List, Optional
from services.job_service import job_service

router = APIRouter(prefix="/projects", tags=["Projects"])


# --- SCHEMAS ---
# NOTE: Changing these schemas will break the frontend's ability to parse data.
# Projects.jsx depends on 'pending_count', 'accepted_count', and 'declined_count' 
# to decide which tab a job appears in (e.g., 'Yet to Assign' vs 'Current').

class JobCreate(BaseModel):
    title: str
    client: Optional[str] = None
    venue: Optional[str] = None
    budget: Optional[int] = 0
    category: str
    date: Optional[datetime] = None
    roles: Optional[List[str]] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    client: Optional[str] = None
    venue: Optional[str] = None
    budget: Optional[int] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[str] = None
    roles: Optional[List[str]] = None

class JobResponse(BaseModel):
    id: int # The unique ID of the job
    user_id: int # The ID of the user who created it
    title: str
    client: Optional[str] = None
    venue: Optional[str] = None
    budget: Optional[int] = 0
    category: Optional[str] = None
    date: Optional[datetime] = None
    status: str = "open"
    roles: List[str] = []
    pending_count: int = 0
    accepted_count: int = 0
    declined_count: int = 0
    is_completed: bool = False # Computed on backend based on date vs today

    class Config:
        from_attributes = True


# --- ENDPOINTS ---

@router.post("/", response_model=JobResponse)
async def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Creates a new job. 
    Frontend Impact: Triggered by 'Post New Job' button in Projects.jsx.

    Modification Risk: If 'status' default is changed from 'open', frontend filters 
    in 'Yet to Assign' might stop working.
    """
    new_job = models.Job(
        title=job.title,
        client=job.client,
        location=job.venue,
        budget=job.budget,
        category=job.category,
        date=job.date or datetime.utcnow(),
        user_id=current_user.id,
        status="open",
        roles=",".join(job.roles) if job.roles else ""
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    # Real-time refresh for Studio Owner
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "projects"
    }, current_user.id)

    return {

        **new_job.__dict__,
        "roles": new_job.roles.split(",") if new_job.roles else [],
        "pending_count": 0,
        "accepted_count": 0,
        "declined_count": 0
    }

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetches all jobs created by the logged-in Studio Owner.
    Frontend Impact: Populates the 'My Jobs' grid in Projects.jsx.

    SORTING: Returns jobs in chronological order (Current/Future first, Past last).
    """
    jobs = db.query(models.Job).filter(models.Job.user_id == current_user.id).all()
    
    result = []
    for job in jobs:
        pending, accepted, declined = job_service.get_job_counts(db, job.id)
        result.append(job_service.format_job_response(job, pending, accepted, declined))
        
    # Apply centralized chronological sorting (Upcoming first, Past last)
    return job_service.sort_chronologically(result)



@router.get("/{job_id}", response_model=JobResponse)
async def get_job_by_id(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Allow access if user is either the owner OR an assigned member
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    is_owner = job.user_id == current_user.id
    is_assigned = db.query(models.Assignment).filter(
        models.Assignment.job_id == job_id, 
        models.Assignment.member_id == current_user.id
    ).first() is not None
    
    if not (is_owner or is_assigned):
        raise HTTPException(status_code=403, detail="Not authorized to view this job")

    pending, accepted, declined = job_service.get_job_counts(db, job.id)
    return job_service.format_job_response(job, pending, accepted, declined)

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Lifecycle Protection: Block editing for completed or past jobs
    from datetime import datetime
    if job.status == "completed" or (job.date and job.date < datetime.utcnow()):
        raise HTTPException(status_code=403, detail="Cannot edit completed or past jobs")

    if job_update.title is not None:
        job.title = job_update.title
    if job_update.client is not None:
        job.client = job_update.client
    if job_update.venue is not None:
        job.location = job_update.venue
    if job_update.budget is not None:
        job.budget = job_update.budget
    if job_update.category is not None:
        job.category = job_update.category
    if job_update.date is not None:
        job.date = job_update.date
    if job_update.status is not None:
        job.status = job_update.status
    if job_update.roles is not None:
        job.roles = ",".join(job_update.roles)

    db.commit()
    db.refresh(job)

    # Real-time refresh for Studio Owner
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "projects"

    }, current_user.id)

    pending, accepted, declined = job_service.get_job_counts(db, job.id)
    return job_service.format_job_response(job, pending, accepted, declined)

@router.delete("/{job_id}")
async def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    db.delete(job)
    db.commit()
    
    # Real-time refresh for Studio Owner
    await manager.send_personal_message({
        "type": "REFRESH_PAGE",
        "page": "projects"

    }, current_user.id)
    
    return {"message": "Job deleted successfully"}
