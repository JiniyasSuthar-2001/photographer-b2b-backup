from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import User, Job, JobRequest, Team, Notification, Assignment, Task
import random

class DemoService:
    @staticmethod
    def seed_admin_data(db: Session, admin_id: int):
        """
        Populates a 'Perfect' future state for the Investor Showcase account.
        This mirrors the mockData.js structure for persistence.
        """
        # 1. CORE PHOTOGRAPHERS (Showcase Team)
        photographers_data = [
            {"username": "aarav_s",   "full_name": "Aarav Sharma",   "category": "Lead",             "phone": "9876500001", "city": "Ahmedabad", "email": "aarav@example.com"},
            {"username": "ishani_p",  "full_name": "Ishani Patel",   "category": "Candid",           "phone": "9876500002", "city": "Mumbai", "email": "ishani@example.com"},
            {"username": "rohan_m",   "full_name": "Rohan Mehta",    "category": "Drone",            "phone": "9876500003", "city": "Surat", "email": "rohan@example.com"},
            {"username": "sana_k",    "full_name": "Sana Khan",      "category": "Reel",             "phone": "9876500004", "city": "Ahmedabad", "email": "sana@example.com"},
            {"username": "vikram_s",  "full_name": "Vikram Singh",   "category": "Traditional",      "phone": "9876500005", "city": "Rajkot", "email": "vikram@example.com"},
            {"username": "priya_d",   "full_name": "Priya Das",      "category": "Cinematographer",  "phone": "9876500006", "city": "Baroda", "email": "priya@example.com"},
            {"username": "karan_m",   "full_name": "Karan Malhotra", "category": "Assistant",        "phone": "9876500007", "city": "Ahmedabad", "email": "karan@example.com"},
            {"username": "ananya_i",  "full_name": "Ananya Iyer",    "category": "Creative Director","phone": "9876500008", "city": "Mumbai", "email": "ananya@example.com"},
        ]

        photographer_users = []
        for p_data in photographers_data:
            # Check by both username and phone to prevent IntegrityError
            user = db.query(User).filter(
                (User.username == p_data["username"]) | (User.phone == p_data["phone"])
            ).first()
            
            if not user:
                user = User(
                    username=p_data["username"],
                    hashed_password="hashed_password",
                    full_name=p_data["full_name"],
                    category=p_data["category"],
                    phone=p_data["phone"],
                    email=p_data.get("email", f"{p_data['username']}@example.com"),
                    city=p_data["city"],
                    user_type="photographer"
                )
                db.add(user)
                db.flush() # Flush to get ID without full commit yet
            photographer_users.append(user)
        
        db.commit() # Commit all users at once

        # 2. SYNC TEAM DIRECTORY
        for p_user in photographer_users:
            exists = db.query(Team).filter(Team.owner_id == admin_id, Team.member_id == p_user.id).first()
            if not exists:
                new_team_member = Team(
                    owner_id=admin_id,
                    member_id=p_user.id,
                    display_name=p_user.full_name,
                    display_category=p_user.category,
                    display_city=p_user.city,
                    phone=p_user.phone
                )
                db.add(new_team_member)

        # 3. HIGH-VALUE JOBS (Investor Showcase)
        # Mix of future (open/assigned) and past (completed) jobs for analytics
        jobs_data = [
            {"title": "The Oberoi Destination Wedding", "client": "Malhotra & Kapoor", "category": "Wedding", "budget": 250000, "location": "Udaipur, RJ", "venue": "Udaidvilas Palace", "status": "assigned", "offset": 7, "roles": "Lead, Candid, Drone, Reel"},
            {"title": "TechCon Global Summit", "client": "Google India", "category": "Corporate", "budget": 85000, "location": "Ahmedabad, GJ", "venue": "Mahatma Mandir", "status": "assigned", "offset": 12, "roles": "Lead, Candid"},
            {"title": "Sabyasachi Heritage Campaign", "client": "Sabyasachi Mukherjee", "category": "Commercial", "budget": 120000, "location": "Mumbai, MH", "venue": "Ballard Estate", "status": "open", "offset": 18, "roles": "Cinematographer, Candid"},
            {"title": "Real Estate Portfolio", "client": "Adani Realty", "category": "Commercial", "budget": 35000, "location": "Surat, GJ", "venue": "Adani Shantigram", "status": "open", "offset": 25, "roles": "Drone"},
            {"title": "Grand Sangeet Night", "client": "Mehta Family", "category": "Wedding", "budget": 45000, "location": "Ahmedabad, GJ", "venue": "Karnavati Club", "status": "completed", "offset": -5, "roles": "Reel, Traditional"},
            # Historical data for analytics
            {"title": "Winter Gala 2025", "client": "Reliance", "category": "Corporate", "budget": 65000, "location": "Mumbai, MH", "venue": "Jio World", "status": "completed", "offset": -30, "roles": "Lead"},
            {"title": "Product Launch", "client": "Apple India", "category": "Commercial", "budget": 95000, "location": "Bangalore, KA", "venue": "UB City", "status": "completed", "offset": -45, "roles": "Cinematographer"},
            {"title": "Spring Wedding", "client": "Sharma Family", "category": "Wedding", "budget": 180000, "location": "Ahmedabad, GJ", "venue": "Gulmohar", "status": "completed", "offset": -60, "roles": "Lead, Candid"},
            {"title": "Corporate Portrait", "client": "TCS", "category": "Corporate", "budget": 25000, "location": "Pune, MH", "venue": "TCS Campus", "status": "completed", "offset": -90, "roles": "Lead"},
        ]

        admin_jobs = []
        for j_data in jobs_data:
            # Check for existing job by title and user to prevent duplicates
            exists = db.query(Job).filter(
                (Job.user_id == admin_id) & (Job.title == j_data["title"])
            ).first()
            
            if not exists:
                job_date = datetime.utcnow() + timedelta(days=j_data["offset"])
                new_job = Job(
                    title=j_data["title"],
                    client=j_data["client"],
                    category=j_data["category"],
                    budget=j_data["budget"],
                    location=j_data["location"],
                    venue=j_data["venue"],
                    status=j_data["status"],
                    date=job_date,
                    user_id=admin_id,
                    roles=j_data["roles"]
                )
                db.add(new_job)
                db.flush()
                admin_jobs.append(new_job)
            else:
                admin_jobs.append(exists)
        
        db.commit()

        # 4. INTERCONNECTED REQUESTS & ASSIGNMENTS
        for job in admin_jobs:
            if job.status == "assigned":
                # Assign photographers to the Udaipur Wedding
                if "Oberoi" in job.title:
                    team_for_wedding = [photographer_users[0], photographer_users[1], photographer_users[2], photographer_users[3]] # Aarav, Ishani, Rohan, Sana
                    for p in team_for_wedding:
                        req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                        if not req_exists:
                            role = p.category.split(' ')[0]
                            db.add(JobRequest(job_id=job.id, sender_id=admin_id, receiver_id=p.id, role=role, budget=job.budget // 5, status="accepted"))
                            db.add(Assignment(job_id=job.id, member_id=p.id, role=role))
                
                elif "TechCon" in job.title:
                     p = photographer_users[1] # Ishani
                     req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                     if not req_exists:
                        db.add(JobRequest(job_id=job.id, sender_id=admin_id, receiver_id=p.id, role="Candid", budget=25000, status="accepted"))
                        db.add(Assignment(job_id=job.id, member_id=p.id, role="Candid"))

            elif job.status == "open" and "Sabyasachi" in job.title:
                # One pending invite to Priya
                p = photographer_users[5] # Priya
                req_exists = db.query(JobRequest).filter(JobRequest.job_id == job.id, JobRequest.receiver_id == p.id).first()
                if not req_exists:
                    db.add(JobRequest(job_id=job.id, sender_id=admin_id, receiver_id=p.id, role="Cinematographer", budget=50000, status="pending"))
        
        db.commit()

        # 5. PROFESSIONAL NOTIFICATIONS
        notif_data = [
            {"title": "New Job Invite", "message": "Vogue France has invited you to work on 'Cannes Fashion Week Coverage' as Lead.", "type": "job_invite", "redirect": "/other-projects"},
            {"title": "Request Accepted", "message": "Ishani Patel accepted your request for 'TechCon Global Summit'.", "type": "job_invite", "redirect": "/projects"},
            {"title": "Advance Received", "message": "Advance payment of ₹1,00,000 received for Udaipur Wedding.", "type": "payment", "redirect": "/analytics"},
            {"title": "Team Alert", "message": "Priya Das has updated her equipment: Sony FX3 added.", "type": "team_request", "redirect": "/team"},
        ]

        for n in notif_data:
            notif_exists = db.query(Notification).filter(Notification.user_id == admin_id, Notification.message == n["message"]).first()
            if not notif_exists:
                db.add(Notification(user_id=admin_id, title=n["title"], message=n["message"], type=n["type"], redirect_to=n["redirect"]))

        # 6. JOB TASKS (Checklist Sync)
        task_map = {
            "Oberoi": ["Coordinate with Udaipur travel desk", "Scout locations at Udaidvilas", "Finalize gear list for 4-day shoot"],
            "TechCon": ["Apply for Mahatma Mandir press pass", "Check battery levels for all wireless mics"],
            "Sabyasachi": ["Review vintage lookbook with Creative Director"],
        }

        for job in admin_jobs:
            for key, t_list in task_map.items():
                if key in job.title:
                    for t_text in t_list:
                        exists = db.query(Task).filter(Task.job_id == job.id, Task.text == t_text).first()
                        if not exists:
                            db.add(Task(job_id=job.id, text=t_text, completed=False))

        # 7. INCOMING REQUESTS (Admin acting as Freelancer)
        # Create an 'External Global Studio' to send jobs TO the admin
        ext_studio = db.query(User).filter(User.username == "ext_studio_vogue").first()
        if not ext_studio:
            ext_studio = User(
                username="ext_studio_vogue",
                hashed_password="hashed_password",
                full_name="Vogue France",
                user_type="studio_owner",
                phone="0123456789",
                email="vogue@example.com"
            )
            db.add(ext_studio)
            db.commit()
            db.refresh(ext_studio)

        # A. Pending Invite to Admin
        if not db.query(Job).filter(Job.title == "Cannes Fashion Week Coverage").first():
            ext_job_1 = Job(title="Cannes Fashion Week Coverage", date=datetime.utcnow() + timedelta(days=60), user_id=ext_studio.id, category="Fashion", budget=120000, roles="Lead")
            db.add(ext_job_1)
            db.flush()
            db.add(JobRequest(job_id=ext_job_1.id, sender_id=ext_studio.id, receiver_id=admin_id, role="Lead", budget=120000, status="pending"))

        # B. Accepted Job for Admin
        if not db.query(Job).filter(Job.title == "BMW M-Series Launch").first():
            ext_job_2 = Job(title="BMW M-Series Launch", date=datetime.utcnow() + timedelta(days=40), user_id=ext_studio.id, category="Automotive", budget=85000, roles="Cinematographer")
            db.add(ext_job_2)
            db.flush()
            db.add(JobRequest(job_id=ext_job_2.id, sender_id=ext_studio.id, receiver_id=admin_id, role="Cinematographer", budget=85000, status="accepted"))
            db.add(Assignment(job_id=ext_job_2.id, member_id=admin_id, role="Cinematographer"))

        # C. Past Assignment for Admin
        if not db.query(Job).filter(Job.title == "Paris Fashion Week").first():
            ext_job_3 = Job(title="Paris Fashion Week", date=datetime.utcnow() - timedelta(days=30), user_id=ext_studio.id, category="Fashion", budget=150000, roles="Lead", status="completed")
            db.add(ext_job_3)
            db.flush()
            db.add(JobRequest(job_id=ext_job_3.id, sender_id=ext_studio.id, receiver_id=admin_id, role="Lead", budget=150000, status="accepted"))
            db.add(Assignment(job_id=ext_job_3.id, member_id=admin_id, role="Lead"))

        # D. Declined Project for Admin
        if not db.query(Job).filter(Job.title == "Milan Street Style").first():
            ext_job_4 = Job(title="Milan Street Style", date=datetime.utcnow() + timedelta(days=20), user_id=ext_studio.id, category="Fashion", budget=75000, roles="Candid")
            db.add(ext_job_4)
            db.flush()
            db.add(JobRequest(job_id=ext_job_4.id, sender_id=ext_studio.id, receiver_id=admin_id, role="Candid", budget=75000, status="declined"))

        db.commit()
        return True

demo_service = DemoService()
