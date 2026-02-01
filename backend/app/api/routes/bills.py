from datetime import date

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.bills import CreateRecurringItemRequest, MonthlyTotals, RecurringItem, RecurringOverview, UpdateRecurringItemRequest

router = APIRouter(prefix="/bills")


@router.get("/items", response_model=list[RecurringItem])
def list_items(_user_id: str = Depends(get_current_user_id)) -> list[RecurringItem]:
    return []


@router.post("/items", response_model=RecurringItem)
def create_item(payload: CreateRecurringItemRequest, _user_id: str = Depends(get_current_user_id)) -> RecurringItem:
    return RecurringItem(
        id="ri_1",
        user_id="me",
        name=payload.name,
        kind=payload.kind,
        category=payload.category,
        amount=payload.amount,
        due_day=payload.due_day,
        reminder_days_before=payload.reminder_days_before,
        auto_pay_enabled=payload.auto_pay_enabled,
        is_active=payload.is_active,
        notes=payload.notes,
    )


@router.patch("/items/{item_id}")
def update_item(_item_id: str, _payload: UpdateRecurringItemRequest, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.delete("/items/{item_id}")
def delete_item(_item_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.get("/overview", response_model=RecurringOverview)
def overview(_user_id: str = Depends(get_current_user_id)) -> RecurringOverview:
    return RecurringOverview(
        items=[],
        monthly_totals=MonthlyTotals(bills=0.0, subs=0.0, total=0.0),
        upcoming=[],
    )
