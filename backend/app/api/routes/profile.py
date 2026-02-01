from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.me import UserProfileData

router = APIRouter(prefix="/me")


@router.get("/profile", response_model=UserProfileData)
def get_profile(_user_id: str = Depends(get_current_user_id)) -> UserProfileData:
    return UserProfileData(trips=[], expenses=[])
