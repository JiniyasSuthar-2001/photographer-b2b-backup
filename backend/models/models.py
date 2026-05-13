# ==================================================================================
# DATABASE MODELS
# Purpose: Defines the schema for the Lumière platform.
# Impact: Every field here maps to a data point in the Frontend.
# ==================================================================================

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime

class User(Base):
    """
    Stores core user profile data.
    Frontend Impact: 'user_type' determines if the user sees the Photographer dashboard (Studio Owner) or Freelancer dashboard.
    
    ROLE SYSTEM UPGRADE:
    - photographer: (Old Studio Owner) Can post jobs, manage teams.
    - freelancer: (Old Photographer) Can accept invites, view assigned work.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    city = Column(String, nullable=True)
    category = Column(String) # Now referred to as 'Roles' in the UI
    user_type = Column(String, default='photographer') # photographer, freelancer

    active_devices = Column(Integer, default=0, nullable=False)
    
    # Subscription Fields
    is_pro = Column(Boolean, default=False)
    plan = Column(String, default='Starter')
    is_on_trial = Column(Boolean, default=True)
    trial_days_left = Column(Integer, default=14)
    subscription_expiry = Column(DateTime, nullable=True)

    # Referral Fields
    referral_code = Column(String(8), unique=True, index=True)
    referred_by = Column(String(8), nullable=True)
    first_purchase_completed = Column(Boolean, default=False)

    # Relationships
    jobs_owned = relationship("Job", back_populates="owner")
    assignments = relationship("Assignment", back_populates="member")
    sent_requests = relationship("TeamRequest", foreign_keys="[TeamRequest.sender_id]", back_populates="sender")
    received_requests = relationship("TeamRequest", foreign_keys="[TeamRequest.receiver_id]", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user")


class Job(Base):
    """
    Stores job details created by Studio Owners.
    Frontend Impact: Populates the 'My Jobs' section in JobHub.jsx.
    
    LIFECYCLE FLOW:
    - Status can be 'open', 'completed', 'assigned', 'cancelled'.
    - If Job Date < Today, the system automatically treats it as 'completed' in the UI.
    - Status 'completed' locks all editing and request sending (enforced in Service layer).
    
    ROLE ARCHITECTURE:
    - 'roles' field stores the required workforce (e.g., '2x Drone, 1x Lead').
    - Multi-role support allows requesting multiple quantities of the same role.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    client = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String) # Now a free-text field, no longer affects filtering logic.
    status = Column(String, default="open") # open, completed, assigned, cancelled
    budget = Column(Integer, default=0)
    location = Column(String)
    venue = Column(String)
    roles = Column(String) # Stores role requirements (e.g., "2x Drone, 1x Lead")

    owner = relationship("User", back_populates="jobs_owned")
    assignments = relationship("Assignment", back_populates="job")
    requests = relationship("JobRequest", back_populates="job")
    tasks = relationship("Task", back_populates="job")

    @property
    def is_past(self):
        """Helper to determine if job is older than today."""
        return self.date < datetime.utcnow()


class Assignment(Base):
    """
    Intersection table linking Photographers to Jobs.
    Frontend Impact: Determines which jobs appear in the 'Accepted Jobs' tab for Photographers.
    """
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    member_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String) # Lead, Assistant, etc.

    job = relationship("Job", back_populates="assignments")
    member = relationship("User", back_populates="assignments")

class TeamRequest(Base):
    """
    Handles requests for photographers to join a Studio Owner's team directory.
    Frontend Impact: Populates notifications and the Team management page.
    """
    __tablename__ = "team_requests"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending") # pending, accepted, declined
    created_at = Column(DateTime, default=datetime.utcnow)

    # Custom info entered by studio owner
    display_name = Column(String)
    display_category = Column(String)
    display_city = Column(String)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")

class JobRequest(Base):
    """
    Handles specific job invitations.
    Frontend Impact: Populates the 'Invites' and 'Declined Jobs' tabs in JobHub.jsx.
    Risk: Modification of 'status' here will break the photographer's ability to accept/decline work.
    """
    __tablename__ = "job_requests"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)
    budget = Column(Integer)
    status = Column(String, default="pending") # pending, accepted, declined
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="requests")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Team(Base):
    """
    The local 'directory' for a Studio Owner.
    Frontend Impact: Populates the Team list in Team.jsx.
    Note: 'phone' is used as the primary identifier for adding members.
    """
    __tablename__ = "team"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    member_id = Column(Integer, ForeignKey("users.id"))
    
    # Identity info preserved on studio owner's side
    display_name = Column(String)
    display_category = Column(String)
    display_city = Column(String)
    phone = Column(String)

class Notification(Base):
    """
    Global notification system.
    Frontend Impact: Populates the NotificationBell.jsx dropdown.
    Logic: 'redirect_to' stores the frontend URL (e.g., /job-hub) to navigate to 
    when the user clicks the notification.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String) # e.g., "New Job Invite"
    message = Column(String)
    type = Column(String) # e.g., "job_invite", "team_request"
    reference_id = Column(Integer, nullable=True) # ID of the related object
    redirect_to = Column(String) # Critical for navigation
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Task(Base):
    """
    Checklist items for a specific job.
    Frontend Impact: Populates the Notes.jsx page.
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    text = Column(String)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="tasks")

# --- NEW MODELS FOR REFERRAL, PAYMENT & SUBSCRIPTION ---

class Payment(Base):
    """
    Tracks payment transactions.
    """
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    currency = Column(String, default="INR")
    status = Column(String, default="pending") # pending, success, failed
    transaction_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="payments")

class SubscriptionHistory(Base):
    """
    Tracks subscription changes over time.
    """
    __tablename__ = "subscription_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan = Column(String)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="subscription_logs")

class ReferralHistory(Base):
    """
    Logs successful referral rewards.
    """
    __tablename__ = "referral_history"
    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id")) # Person who shared their code
    referred_user_id = Column(Integer, ForeignKey("users.id")) # Person who used the code
    days_earned = Column(Integer, default=15)
    created_at = Column(DateTime, default=datetime.utcnow)

    referrer = relationship("User", foreign_keys=[referrer_id], backref="referrals_given")
    referred_user = relationship("User", foreign_keys=[referred_user_id], backref="referral_received")

class IdentityOwnership(Base):
    """
    Strict mapping of email/phone to a specific user ID.
    Prevents reuse of identity across different accounts.
    """
    __tablename__ = "identity_ownership"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    identity_type = Column(String) # email, phone
    identity_value = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="owned_identities")

class WebSocketSession(Base):
    """
    Tracks active websocket sessions for real-time broadcasting.
    """
    __tablename__ = "websocket_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    connection_id = Column(String, unique=True)
    status = Column(String, default="online")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="ws_sessions")
