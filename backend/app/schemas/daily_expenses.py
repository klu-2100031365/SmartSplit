from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel

from app.schemas.common import APIModel


PaymentMethod = Literal["Cash", "Card", "UPI", "Net Banking", "Other"]
SourceType = Literal["trip", "dining", "movies", "play", "entertainment", "investments", "manual"]


class DailyCategory(APIModel):
    id: str
    user_id: str
    name: str
    icon: str
    color: str
    is_custom: bool


class DailyExpense(APIModel):
    id: str
    user_id: str
    description: str
    amount: float
    date: datetime
    category_id: str
    payment_method: PaymentMethod
    notes: str | None = None
    source_id: str | None = None
    source_type: SourceType | None = None
    metadata: Any | None = None


class DailyStats(APIModel):
    total_spent: float
    monthly_spent: float
    avg_daily: float
    category_breakdown: dict[str, float]
    category_breakdown_items: list[dict[str, Any]] | None = None
    spent_vs_salary_percent: float | None = None
    salary_status: Literal["safe", "caution", "overspending"] | None = None
    salary_message: str | None = None
    remaining_salary: float | None = None


class CreateDailyExpenseRequest(APIModel):
    description: str
    amount: float
    date: datetime
    category_id: str
    payment_method: PaymentMethod
    notes: str | None = None


class UpdateDailyExpenseRequest(APIModel):
    description: str | None = None
    amount: float | None = None
    date: datetime | None = None
    category_id: str | None = None
    payment_method: PaymentMethod | None = None
    notes: str | None = None


class SalaryResponse(APIModel):
    monthly_salary: float | None = None


class UpdateSalaryRequest(APIModel):
    monthly_salary: float


class SyncRequest(BaseModel):
    sources: list[str]


class SyncResponse(APIModel):
    count: int
