from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models.models import Job, User, Assignment, JobRequest
from datetime import datetime, timedelta
from typing import List, Dict

class AnalyticsService:
    @staticmethod
    def get_timeframe_range(timeframe: str):
        now = datetime.utcnow()
        if timeframe == '1W': return now - timedelta(days=7)
        if timeframe == '1M': return now - timedelta(days=30)
        if timeframe == '3M': return now - timedelta(days=90)
        if timeframe == '6M': return now - timedelta(days=180)
        if timeframe == '1Y': return now - timedelta(days=365)
        if timeframe == '2Y': return now - timedelta(days=730)
        return now - timedelta(days=30) # Default 1M

    @staticmethod
    def get_role_analytics(db: Session, user_id: int, role: str, timeframe: str):
        """
        Aggregates analytics data based on the active role and timeframe.
        Photographer = Owned Jobs (Studio)
        Freelancer = Accepted Invites (External)
        """
        start_date = AnalyticsService.get_timeframe_range(timeframe)
        
        if role == 'photographer':
            # Owned Jobs
            jobs = db.query(Job).filter(
                and_(Job.user_id == user_id, Job.date >= start_date)
            ).all()
            
            # Revenue = Sum of budgets of owned jobs
            total_revenue = sum(j.budget for j in jobs if j.budget) or 0
            total_jobs = len(jobs)
            
            # Trends (grouped by day/month based on timeframe)
            # For simplicity, we'll return raw jobs for the frontend to process trends
            
        else:
            # Freelancer = Accepted Job Requests
            requests = db.query(JobRequest).filter(
                and_(
                    JobRequest.receiver_id == user_id, 
                    JobRequest.status == 'accepted',
                    JobRequest.created_at >= start_date
                )
            ).all()
            
            total_revenue = sum(r.budget for r in requests if r.budget) or 0
            total_jobs = len(requests)

        return {
            "total_revenue": total_revenue,
            "total_jobs": total_jobs,
            "role": role,
            "timeframe": timeframe
        }

    @staticmethod
    def get_revenue_trends(db: Session, user_id: int, timeframe: str):
        """Calculates revenue and job count trends over the given timeframe."""
        start_date = AnalyticsService.get_timeframe_range(timeframe)
        
        # We'll group by date
        jobs = db.query(
            func.date(Job.date).label('day'),
            func.sum(Job.budget).label('revenue'),
            func.count(Job.id).label('count')
        ).filter(and_(Job.user_id == user_id, Job.date >= start_date))\
         .group_by(func.date(Job.date))\
         .order_by(func.date(Job.date)).all()

        return [
            {
                "date": str(j.day),
                "revenue": j.revenue or 0,
                "jobs": j.count
            }
            for j in jobs
        ]

    @staticmethod
    def get_category_stats(db: Session, user_id: int):
        """Calculates job count distribution across categories."""
        stats = db.query(
            Job.category,
            func.count(Job.id).label('count')
        ).filter(Job.user_id == user_id)\
         .group_by(Job.category).all()

        return [
            {
                "category": s.category or "Other",
                "count": s.count
            }
            for s in stats
        ]

    @staticmethod
    def get_top_photographers(db: Session, user_id: int):
        """
        Calculates rankings for photographers who have collaborated most with the current user.
        Based on JobRequests sent by the studio owner and accepted by members.
        """
        # Get accepted requests sent by this user
        collaborations = db.query(
            User.full_name,
            User.id,
            func.count(JobRequest.id).label('jobs_done'),
            func.sum(JobRequest.budget).label('total_earnings')
        ).join(JobRequest, User.id == JobRequest.receiver_id)\
         .filter(and_(JobRequest.sender_id == user_id, JobRequest.status == 'accepted'))\
         .group_by(User.id)\
         .order_by(func.count(JobRequest.id).desc())\
         .limit(10).all()

        return [
            {
                "photographer_name": c.full_name or f"User {c.id}",
                "photographer_id": c.id,
                "jobs_done_together": c.jobs_done,
                "earnings_generated": c.total_earnings or 0,
                "rating": 4.8, # Placeholder for now
                "latest_collaboration_date": "2024-05-01" # Placeholder
            }
            for c in collaborations
        ]

analytics_service = AnalyticsService()
