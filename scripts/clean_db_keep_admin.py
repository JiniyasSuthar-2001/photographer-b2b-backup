#!/usr/bin/env python3
"""
Safe DB cleaner: backs up the SQLite database and removes all data created by tests
while preserving the admin account (username='admin').

Run from repo root:
  python scripts/clean_db_keep_admin.py

This script is conservative: it keeps the `users` row for username 'admin' and
removes other users and all records that do not involve the admin user.
"""
import shutil
import time
import sys
from pathlib import Path

# Ensure repo root is importable so 'backend' package can be imported when running this script
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
# Also insert backend directory so imports like `from db.database import ...` resolve
BACKEND_DIR = ROOT / 'backend'
sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.db.database import SessionLocal, DB_PATH
    from backend.models import models
except Exception as e:
    print("Failed to import application modules. Run this from the project root where backend package is available.")
    raise

DB_PATH = Path(DB_PATH)

def backup_db(db_path: Path) -> Path:
    ts = int(time.time())
    bak = db_path.with_suffix(db_path.suffix + f".bak.{ts}")
    shutil.copy(db_path, bak)
    return bak

def main():
    if not DB_PATH.exists():
        print(f"Database file not found at {DB_PATH}")
        sys.exit(1)

    print(f"Backing up DB: {DB_PATH}")
    bak = backup_db(DB_PATH)
    print(f"Backup created: {bak}")

    session = SessionLocal()
    try:
        User = models.User
        Job = models.Job
        Assignment = models.Assignment
        TeamRequest = models.TeamRequest
        JobRequest = models.JobRequest
        Team = models.Team
        Notification = models.Notification
        Task = models.Task
        Payment = models.Payment
        SubscriptionHistory = models.SubscriptionHistory
        ReferralHistory = models.ReferralHistory
        IdentityOwnership = models.IdentityOwnership
        WebSocketSession = models.WebSocketSession

        admin = session.query(User).filter(User.username == 'admin').first()
        if not admin:
            print("Admin user with username 'admin' not found. Aborting to avoid accidental data loss.")
            return

        admin_id = admin.id
        print(f"Found admin user id={admin_id}. Proceeding to remove other data...")

        # Find admin's job ids to preserve related tasks/assignments linked to admin-owned jobs
        admin_job_ids = [j.id for j in session.query(Job).filter(Job.user_id == admin_id).all()]

        stats = []

        def delete_q(q, name):
            n = q.count()
            if n:
                q.delete(synchronize_session=False)
            stats.append((name, n))

        # Delete rows that do NOT involve admin
        # Team: keep rows where owner_id == admin OR member_id == admin; delete others
        delete_q(session.query(Team).filter((Team.owner_id != admin_id) & (Team.member_id != admin_id)), 'team')

        # TeamRequest and JobRequest: keep ones involving admin
        delete_q(session.query(TeamRequest).filter((TeamRequest.sender_id != admin_id) & (TeamRequest.receiver_id != admin_id)), 'team_requests')
        delete_q(session.query(JobRequest).filter((JobRequest.sender_id != admin_id) & (JobRequest.receiver_id != admin_id)), 'job_requests')

        # Assignments: keep assignments where member==admin OR job owned by admin
        if admin_job_ids:
            delete_q(session.query(Assignment).filter((Assignment.member_id != admin_id) & (~Assignment.job_id.in_(admin_job_ids))), 'assignments')
        else:
            delete_q(session.query(Assignment).filter(Assignment.member_id != admin_id), 'assignments')

        # Notifications: delete notifications for non-admin users
        delete_q(session.query(Notification).filter(Notification.user_id != admin_id), 'notifications')

        # Tasks: keep tasks whose job is owned by admin; delete others
        if admin_job_ids:
            delete_q(session.query(Task).filter(~Task.job_id.in_(admin_job_ids)), 'tasks')
        else:
            delete_q(session.query(Task), 'tasks')

        # Payments / subscription / referrals: delete entries not tied to admin
        delete_q(session.query(Payment).filter(Payment.user_id != admin_id), 'payments')
        delete_q(session.query(SubscriptionHistory).filter(SubscriptionHistory.user_id != admin_id), 'subscription_history')
        delete_q(session.query(ReferralHistory).filter((ReferralHistory.referrer_id != admin_id) & (ReferralHistory.referred_user_id != admin_id)), 'referral_history')

        # Identity ownership & websocket sessions
        delete_q(session.query(IdentityOwnership).filter(IdentityOwnership.user_id != admin_id), 'identity_ownership')
        delete_q(session.query(WebSocketSession).filter(WebSocketSession.user_id != admin_id), 'websocket_sessions')

        # Jobs: delete jobs not owned by admin
        delete_q(session.query(Job).filter(Job.user_id != admin_id), 'jobs')

        # Finally, delete all users except admin
        delete_q(session.query(User).filter(User.username != 'admin'), 'users')

        session.commit()

        print("Deletion summary:")
        for name, n in stats:
            print(f"  {name}: {n}")

        print("Database cleanup complete. Admin account preserved.")
        print(f"Backup located at: {bak}")

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == '__main__':
    main()
