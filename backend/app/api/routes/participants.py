from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id

router = APIRouter(prefix="/participants")


@router.patch("/{participant_id}")
def update_participant(_participant_id: str, _payload: dict, _user_id: str = Depends(get_current_user_id)) -> None:
    return None
