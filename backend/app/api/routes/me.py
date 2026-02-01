from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.daily_expenses import SalaryResponse, UpdateSalaryRequest

router = APIRouter(prefix="/me")


@router.get("/salary", response_model=SalaryResponse)
def get_salary(_user_id: str = Depends(get_current_user_id)) -> SalaryResponse:
    return SalaryResponse(monthly_salary=None)


@router.put("/salary")
def update_salary(_payload: UpdateSalaryRequest, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.get("/trip-shares", response_model=dict[str, float])
def get_trip_shares(_user_id: str = Depends(get_current_user_id)) -> dict[str, float]:
    return {}
