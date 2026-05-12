from db.database import SessionLocal
from models import models

db = SessionLocal()
u = db.query(models.User).filter(models.User.username == "admin").first()
if u:
    print(f"User ID: {u.id}, Name: {u.full_name}, Username: {u.username}")
    
    # Jobs where admin is owner
    owned_jobs = db.query(models.Job).filter(models.Job.user_id == u.id).count()
    print(f"Owned Jobs: {owned_jobs}")
    
    # Requests where admin is receiver
    received_requests = db.query(models.JobRequest).filter(models.JobRequest.receiver_id == u.id).all()
    print(f"Received Requests: {len(received_requests)}")
    for r in received_requests:
        print(f" - Request ID: {r.id}, Job ID: {r.job_id}, Status: {r.status}, Role: {r.role}")
    
    # Assignments for admin
    assignments = db.query(models.Assignment).filter(models.Assignment.member_id == u.id).count()
    print(f"Assignments: {assignments}")
else:
    print("User 'admin' not found!")

db.close()
