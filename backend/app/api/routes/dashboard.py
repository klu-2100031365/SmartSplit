from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.me import UserStats

router = APIRouter(prefix="/me")


@router.get("/stats", response_model=UserStats)
def get_stats(_user_id: str = Depends(get_current_user_id)) -> UserStats:
    return UserStats(total_tracked=0.0, trip_count=0)
