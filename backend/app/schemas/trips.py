from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.common import APIModel, ChartBar, ChartSlice, ChangeLog, MoneyStats


SharePermission = Literal["view", "edit"]
TripType = Literal["trip", "dining", "movies", "play"]


class Trip(APIModel):
    id: str
    name: str
    owner_id: str
    created_at: datetime
    icon: str | None = None
    custom_image: str | None = None
    share_token: str | None = None
    share_permission: SharePermission | None = None
    type: TripType | None = None
    currency: str | None = "INR"


class Participant(APIModel):
    id: str
    trip_id: str
    name: str


class Expense(APIModel):
    id: str
    trip_id: str
    description: str
    amount: float
    date: datetime
    category: str
    paid_by: str
    split_among: list[str] | None = None
    is_payment: bool | None = None


class Settlement(APIModel):
    from_: str = Field(alias="from")
    from_id: str
    to: str
    to_id: str
    amount: float


class SettlementSummary(APIModel):
    settlements: list[Settlement]
    stats: dict[str, MoneyStats]
    balances: dict[str, float]


class DailyBalancePoint(APIModel):
    date: str
    balances: dict[str, float]


GroupedExpenses = list[tuple[str, list[Expense]]]


class CategoryStatsItem(APIModel):
    category: str
    total: float
    involved: dict[str, float]


class TotalPayerStat(APIModel):
    id: str
    name: str
    amount: float
    categories: list[tuple[str, float]]


class IndividualShareStat(APIModel):
    participant: Participant
    total: float
    categories: list[tuple[str, float]]


class AnalyticsData(APIModel):
    participant_stats: list[ChartSlice]
    daily_stats: list[ChartBar]
    category_stats: list[CategoryStatsItem]
    total_trip_cost: float
    total_payer_stats: list[TotalPayerStat]
    individual_share_stats: list[IndividualShareStat]


class TripDetailsView(APIModel):
    trip: Trip
    participants: list[Participant]
    expenses: list[Expense]
    logs: list[ChangeLog]
    settlement_data: SettlementSummary
    daily_balances: list[DailyBalancePoint]
    grouped_expenses: GroupedExpenses
    analytics_data: AnalyticsData
    user_share: float
    share_token: str | None = None
    share_permission: SharePermission | None = None


class CreateTripRequest(APIModel):
    name: str
    icon: str | None = "plane"
    custom_image: str | None = None
    type: TripType | None = "trip"
    currency: str | None = "INR"


class UpdateTripRequest(APIModel):
    name: str | None = None
    icon: str | None = None
    custom_image: str | None = None
    currency: str | None = None


class CreateParticipantRequest(APIModel):
    name: str


class CreateExpenseRequest(APIModel):
    expense: dict[str, Any]
    actor: dict[str, str] | None = None


class UpdateExpenseRequest(APIModel):
    data: dict[str, Any]
    actor: dict[str, str] | None = None


class CreateShareLinkRequest(APIModel):
    permission: SharePermission


class CreateShareLinkResponse(BaseModel):
    token: str
