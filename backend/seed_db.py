from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models import models
from services.auth_service import auth_service
from datetime import datetime, timedelta

def seed_data():
    db = SessionLocal()
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    # 1. CORE USERS
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        admin_user = models.User(
            username="admin",
            hashed_password=auth_service.get_password_hash("admin@001"),
            phone="0000000000",
            full_name="System Admin",
            city="Ahmedabad",
            user_type="photographer" # Note: 'photographer' role is the new unified role
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # Secondary admin users
    for i in range(1, 3):
        u = f"admin0{i}"
        p = f"admin@00{i+1}"
        if not db.query(models.User).filter(models.User.username == u).first():
            new_u = models.User(
                username=u,
                hashed_password=auth_service.get_password_hash(p),
                full_name=f"Admin {i}",
                phone=f"000000000{i}",
                user_type="photographer"
            )
            db.add(new_u)

    # Create a 'Studio Partner' who sends requests to Admin
    partner = db.query(models.User).filter(models.User.username == "studio_partner").first()
    if not partner:
        partner = models.User(
            username="studio_partner",
            hashed_password=auth_service.get_password_hash("password123"),
            phone="9998887776",
            full_name="Elite Studios",
            city="Mumbai",
            user_type="photographer"
        )
        db.add(partner)
        db.commit()
        db.refresh(partner)

    # 2. JOBS FOR ADMIN (AS OWNER)
    # These appear in 'My Jobs'
    for i in range(1, 6):
        job = models.Job(
            title=f"Wedding Project {i}",
            date=datetime.utcnow() + timedelta(days=i*5),
            user_id=admin_user.id,
            category="Wedding",
            status="open",
            budget=25000 + (i * 5000),
            roles="Lead,Candid,Drone"
        )
        db.add(job)

    # 3. JOBS FOR ADMIN (AS FREELANCER/RECEIVER)
    # We create jobs owned by the partner, then send requests to admin
    
    # A. ACCEPTED JOBS (Upcoming)
    for i in range(1, 4):
        job = models.Job(
            title=f"Elite Event {i}",
            date=datetime.utcnow() + timedelta(days=i*3),
            user_id=partner.id,
            category="Corporate",
            status="assigned",
            budget=15000,
            roles="Lead"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        # Create the request (accepted)
        req = models.JobRequest(
            job_id=job.id,
            sender_id=partner.id,
            receiver_id=admin_user.id,
            role="Lead",
            budget=15000,
            status="accepted"
        )
        db.add(req)
        
        # Create the assignment
        assign = models.Assignment(
            job_id=job.id,
            member_id=admin_user.id,
            role="Lead"
        )
        db.add(assign)

    # B. INVITES (Pending)
    for i in range(1, 4):
        job = models.Job(
            title=f"Pending Gala {i}",
            date=datetime.utcnow() + timedelta(days=i*10),
            user_id=partner.id,
            category="Event",
            status="open",
            budget=12000,
            roles="Candid"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        req = models.JobRequest(
            job_id=job.id,
            sender_id=partner.id,
            receiver_id=admin_user.id,
            role="Candid",
            budget=12000,
            status="pending"
        )
        db.add(req)

    # C. PAST ASSIGNMENTS
    for i in range(1, 4):
        job = models.Job(
            title=f"Legacy Shoot {i}",
            date=datetime.utcnow() - timedelta(days=i*15),
            user_id=partner.id,
            category="Portrait",
            status="completed",
            budget=8000,
            roles="Lead"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        assign = models.Assignment(
            job_id=job.id,
            member_id=admin_user.id,
            role="Lead"
        )
        db.add(assign)

    # D. DECLINED JOBS
    for i in range(1, 3):
        job = models.Job(
            title=f"Rejected Offer {i}",
            date=datetime.utcnow() + timedelta(days=20 + i),
            user_id=partner.id,
            category="Other",
            status="open",
            budget=5000,
            roles="Assistant"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        req = models.JobRequest(
            job_id=job.id,
            sender_id=partner.id,
            receiver_id=admin_user.id,
            role="Assistant",
            budget=5000,
            status="declined"
        )
        db.add(req)

    db.commit()
    print("Admin demo data seeded successfully with full lifecycle (Accepted, Pending, Past, Declined)!")
    db.close()

if __name__ == "__main__":
    seed_data()
