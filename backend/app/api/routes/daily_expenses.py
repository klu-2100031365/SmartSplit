from datetime import datetime

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.daily_expenses import (
    CreateDailyExpenseRequest,
    DailyCategory,
    DailyExpense,
    DailyStats,
    SyncRequest,
    SyncResponse,
    UpdateDailyExpenseRequest,
)

router = APIRouter(prefix="/daily-expenses")


@router.get("", response_model=list[DailyExpense])
def list_daily_expenses(_user_id: str = Depends(get_current_user_id)) -> list[DailyExpense]:
    return []


@router.post("", response_model=DailyExpense)
def create_daily_expense(_payload: CreateDailyExpenseRequest, _user_id: str = Depends(get_current_user_id)) -> DailyExpense:
    return DailyExpense(
        id="de_1",
        user_id="me",
        description=_payload.description,
        amount=_payload.amount,
        date=_payload.date,
        category_id=_payload.category_id,
        payment_method=_payload.payment_method,
        notes=_payload.notes,
        source_id=None,
        source_type="manual",
        metadata=None,
    )


@router.patch("/{expense_id}")
def update_daily_expense(_expense_id: str, _payload: UpdateDailyExpenseRequest, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.delete("/{expense_id}")
def delete_daily_expense(_expense_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.get("/categories", response_model=list[DailyCategory])
def list_daily_categories(_user_id: str = Depends(get_current_user_id)) -> list[DailyCategory]:
    return []


@router.get("/stats", response_model=DailyStats)
def get_daily_stats(_user_id: str = Depends(get_current_user_id)) -> DailyStats:
    return DailyStats(
        total_spent=0.0,
        monthly_spent=0.0,
        avg_daily=0.0,
        category_breakdown={},
        category_breakdown_items=[],
        spent_vs_salary_percent=0.0,
        salary_status="safe",
        salary_message="",
        remaining_salary=0.0,
    )


@router.post("/sync", response_model=SyncResponse)
def sync_expenses(_payload: SyncRequest, _user_id: str = Depends(get_current_user_id)) -> SyncResponse:
    return SyncResponse(count=0)


@router.post("/unsync", response_model=SyncResponse)
def unsync_expenses(_payload: SyncRequest, _user_id: str = Depends(get_current_user_id)) -> SyncResponse:
    return SyncResponse(count=0)


@router.get("/__health")
def health() -> dict:
    return {"ok": True, "ts": datetime.utcnow().isoformat()}


# Salary endpoints live under routes/me.py
