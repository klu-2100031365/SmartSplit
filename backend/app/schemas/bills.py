from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from app.schemas.common import APIModel


RecurringItemKind = Literal["bill", "subscription"]
RecurringItemCategory = Literal[
    "wifi",
    "electricity",
    "water",
    "mobile",
    "rent",
    "emi",
    "insurance",
    "netflix",
    "prime",
    "spotify",
    "hotstar",
    "youtube",
    "other",
]


class RecurringItem(APIModel):
    id: str
    user_id: str
    name: str
    kind: RecurringItemKind
    category: RecurringItemCategory
    amount: float
    due_day: int
    reminder_days_before: int
    auto_pay_enabled: bool
    is_active: bool
    notes: str | None = None


class MonthlyTotals(APIModel):
    bills: float
    subs: float
    total: float


class UpcomingItem(APIModel):
    item: RecurringItem
    due_date: str
    days_until_due: int
    reminder_date: str
    days_until_reminder: int


class RecurringOverview(APIModel):
    items: list[RecurringItem]
    monthly_totals: MonthlyTotals
    upcoming: list[UpcomingItem]


class CreateRecurringItemRequest(APIModel):
    name: str
    kind: RecurringItemKind
    category: RecurringItemCategory
    amount: float
    due_day: int
    reminder_days_before: int
    auto_pay_enabled: bool
    is_active: bool
    notes: str | None = None


class UpdateRecurringItemRequest(APIModel):
    name: str | None = None
    kind: RecurringItemKind | None = None
    category: RecurringItemCategory | None = None
    amount: float | None = None
    due_day: int | None = None
    reminder_days_before: int | None = None
    auto_pay_enabled: bool | None = None
    is_active: bool | None = None
    notes: str | None = None
