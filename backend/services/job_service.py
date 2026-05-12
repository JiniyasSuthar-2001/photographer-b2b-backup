from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import models
from datetime import datetime

class JobService:
    @staticmethod
    def get_job_counts(db: Session, job_id: int):
        """Centralized logic for counting job request statuses."""
        pending = db.query(models.JobRequest).filter(
            models.JobRequest.job_id == job_id, 
            models.JobRequest.status == "pending"
        ).count()
        accepted = db.query(models.JobRequest).filter(
            models.JobRequest.job_id == job_id, 
            models.JobRequest.status == "accepted"
        ).count()
        declined = db.query(models.JobRequest).filter(
            models.JobRequest.job_id == job_id, 
            models.JobRequest.status == "declined"
        ).count()
        return pending, accepted, declined

    @staticmethod
    def format_job_response(job: models.Job, pending: int, accepted: int, declined: int):
        """
        Ensures consistent job data structure for the frontend.
        
        LIFECYCLE LOGIC:
        - Compares job.date with current time.
        - If past, 'is_completed' is True and 'status' is forced to 'completed'.
        - This provides immediate feedback to the UI to disable interactions.
        """
        now = datetime.utcnow()
        is_past = job.date < now if job.date else False
        is_completed = is_past or (job.status == "completed")
        
        # Override status if job is past its date or manually completed
        current_status = "completed" if is_completed else (job.status or "open")
        
        return {
            "id": job.id,
            "user_id": job.user_id,
            "title": job.title or "Untitled Job",
            "client": job.client,
            "venue": job.location,
            "budget": job.budget or 0,
            "category": job.category,
            "date": job.date,
            "status": current_status,
            "roles": [r.strip() for r in (job.roles.split(",") if job.roles else []) if r],
            "pending_count": pending,
            "accepted_count": accepted,
            "declined_count": declined,
            "is_completed": is_completed,
            "is_past": is_past
        }

    @staticmethod
    def sort_chronologically(items: list, date_key: str = 'date'):
        """
        GENERIC CHRONOLOGICAL SORTING HELPER
        Supports: Lists of Dictionaries or SQLAlchemy Objects.
        
        Logic:
        1. UPCOMING: date >= today, sorted ASC (closest first).
        2. PAST: date < today, sorted DESC (most recent first).
        
        Why? This ensures the user always sees their most relevant schedule at the top.
        """
        if not items:
            return []

        now = datetime.utcnow()
        
        upcoming = []
        past = []

        for item in items:
            # Handle both dicts and objects
            item_date = item.get(date_key) if isinstance(item, dict) else getattr(item, date_key, None)
            
            # Use status as fallback if available
            is_completed = (item.get('status') == 'completed') if isinstance(item, dict) else (getattr(item, 'status', None) == 'completed')
            
            if is_completed or (item_date and item_date < now):
                past.append(item)
            else:
                upcoming.append(item)

        # Sort upcoming ascending (closest to now first)
        upcoming.sort(key=lambda x: (x.get(date_key) if isinstance(x, dict) else getattr(x, date_key)) or datetime.max)

        # Sort past descending (most recent first)
        past.sort(key=lambda x: (x.get(date_key) if isinstance(x, dict) else getattr(x, date_key)) or datetime.min, reverse=True)

        return upcoming + past

job_service = JobService()


