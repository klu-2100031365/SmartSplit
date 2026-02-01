from fastapi import APIRouter

from app.api.routes import activities, auth, bills, daily_expenses, dashboard, me, participants, profile, share, trips

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(dashboard.router, tags=["dashboard"])
api_router.include_router(profile.router, tags=["profile"])
api_router.include_router(me.router, tags=["me"])
api_router.include_router(participants.router, tags=["participants"])
api_router.include_router(trips.router, tags=["trips"])
api_router.include_router(share.router, tags=["share"])
api_router.include_router(activities.router, tags=["activities"])
api_router.include_router(daily_expenses.router, tags=["daily-expenses"])
api_router.include_router(bills.router, tags=["bills"])
