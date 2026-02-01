from datetime import datetime

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.trips import Trip

router = APIRouter(prefix="/activities")


@router.get("/dining/events", response_model=list[Trip])
def get_dining_events(_user_id: str = Depends(get_current_user_id)) -> list[Trip]:
    return []


@router.get("/movies/events", response_model=list[Trip])
def get_movies_events(_user_id: str = Depends(get_current_user_id)) -> list[Trip]:
    return []


@router.get("/play/events", response_model=list[Trip])
def get_play_events(_user_id: str = Depends(get_current_user_id)) -> list[Trip]:
    return []
