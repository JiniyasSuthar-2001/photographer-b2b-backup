from fastapi import APIRouter
from routers import auth, team, notifications, requests, projects, webhooks, analytics, dashboard, tasks, subscription, referral, calendar, system


api_router = APIRouter()

# Register all sub-routers
api_router.include_router(auth.router)
api_router.include_router(team.router)
api_router.include_router(notifications.router)
api_router.include_router(requests.router)
api_router.include_router(projects.router)
api_router.include_router(webhooks.router)
api_router.include_router(analytics.router)
api_router.include_router(dashboard.router)
api_router.include_router(tasks.router)
api_router.include_router(subscription.router)
api_router.include_router(referral.router)
api_router.include_router(calendar.router)
api_router.include_router(system.router)
