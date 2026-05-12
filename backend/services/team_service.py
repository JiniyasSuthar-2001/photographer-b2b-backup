# ==================================================================================
# SERVICE: TEAM MANAGEMENT
# Purpose: Business logic for team member directories, collaborations, and locking.
# Connected Routers: backend/routers/team.py
# Impact: Affects the availability of photographers in the 'Team Ecosystem' view.
# ==================================================================================

from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import models


class TeamService:
    @staticmethod
    def get_team_directory(db: Session, owner_id: int):
        """
        Fetches the photographer's team with real-time job counts and locking status.
        
        TEAM LOCKING ARCHITECTURE:
        - A member is 'is_locked' if they are already committed to another team ecosystem.
        - Case 1: They have accepted a join request from another photographer.
        - Case 2: They have their own team (others have joined them).
        - Purpose: Prevents conflicting workflows in the photography ecosystem.
        """
        team_entries = db.query(models.Team).filter(models.Team.owner_id == owner_id).all()
        
        data = []
        for entry in team_entries:
            # Count completed jobs shared between owner and member
            jobs_together = db.query(models.Assignment).\
                join(models.Job, models.Assignment.job_id == models.Job.id).\
                filter(and_(
                    models.Job.user_id == owner_id,
                    models.Assignment.member_id == entry.member_id,
                    models.Job.status == "completed"
                )).count()

            # Check if this member is locked (belongs to another team or has their own)
            # 1. Are they a member in ANY team?
            other_teams_count = db.query(models.Team).filter(models.Team.member_id == entry.member_id).count()
            # 2. Are they an owner of a team with members?
            owns_team_count = db.query(models.Team).filter(models.Team.owner_id == entry.member_id).count()
            
            # They are always in the current owner's team, so other_teams_count > 0 is expected.
            # If other_teams_count > 1, they are in MULTIPLE teams (should be blocked by logic, but good to check).
            # If owns_team_count > 0, they are an active Photographer with their own team.
            is_locked = (other_teams_count > 1) or (owns_team_count > 0)

            data.append({
                "id": entry.member_id,
                "name": entry.display_name,
                "city": entry.display_city,
                "phone": entry.phone,
                "category": entry.display_category,
                "jobsCompleted": jobs_together,
                "specialties": [entry.display_category] if entry.display_category else [],
                "status": "locked" if is_locked else "available",
                "is_locked": is_locked,
                "lock_reason": "Already Connected to Another Team" if is_locked else None
            })
        return data


team_service = TeamService()
