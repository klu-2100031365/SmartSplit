from datetime import datetime

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.trips import (
    AnalyticsData,
    CreateParticipantRequest,
    CreateShareLinkRequest,
    CreateShareLinkResponse,
    CreateTripRequest,
    Expense,
    Participant,
    SettlementSummary,
    Trip,
    TripDetailsView,
    UpdateExpenseRequest,
    UpdateTripRequest,
)

router = APIRouter(prefix="/trips")


@router.get("", response_model=list[Trip])
def list_trips(_user_id: str = Depends(get_current_user_id)) -> list[Trip]:
    return []


@router.post("", response_model=Trip)
def create_trip(payload: CreateTripRequest, _user_id: str = Depends(get_current_user_id)) -> Trip:
    return Trip(
        id="trip_1",
        name=payload.name,
        owner_id="user_1",
        created_at=datetime.utcnow(),
        icon=payload.icon,
        custom_image=payload.custom_image,
        share_permission=None,
        type=payload.type,
        currency=payload.currency,
    )


@router.patch("/{trip_id}")
def update_trip(_trip_id: str, _payload: UpdateTripRequest, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.delete("/{trip_id}")
def delete_trip(_trip_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.get("/{trip_id}/view", response_model=TripDetailsView)
def trip_view(trip_id: str, _user_id: str = Depends(get_current_user_id)) -> TripDetailsView:
    trip = Trip(
        id=trip_id,
        name="Trip",
        owner_id="user_1",
        created_at=datetime.utcnow(),
        icon="plane",
        custom_image=None,
        share_token=None,
        share_permission=None,
        type="trip",
        currency="INR",
    )

    settlement_data = SettlementSummary(settlements=[], stats={}, balances={})

    analytics = AnalyticsData(
        participant_stats=[],
        daily_stats=[],
        category_stats=[],
        total_trip_cost=0.0,
        total_payer_stats=[],
        individual_share_stats=[],
    )

    return TripDetailsView(
        trip=trip,
        participants=[],
        expenses=[],
        logs=[],
        settlement_data=settlement_data,
        daily_balances=[],
        grouped_expenses=[],
        analytics_data=analytics,
        user_share=0.0,
        share_token=trip.share_token,
        share_permission=trip.share_permission,
    )


@router.post("/logs/{log_id}/revert")
def revert_log(_log_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.post("/{trip_id}/revert-all")
def revert_all(_trip_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.post("/{trip_id}/share", response_model=CreateShareLinkResponse)
def create_share_link(_trip_id: str, _payload: CreateShareLinkRequest, _user_id: str = Depends(get_current_user_id)) -> CreateShareLinkResponse:
    return CreateShareLinkResponse(token="share-token")


@router.post("/{trip_id}/participants", response_model=Participant)
def add_participant(trip_id: str, payload: CreateParticipantRequest, _user_id: str = Depends(get_current_user_id)) -> Participant:
    return Participant(id="p_1", trip_id=trip_id, name=payload.name)


@router.delete("/{trip_id}/participants/{participant_id}")
def remove_participant(_trip_id: str, _participant_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.post("/{trip_id}/expenses", response_model=Expense)
def add_expense(trip_id: str, payload: dict, _user_id: str = Depends(get_current_user_id)) -> Expense:
    expense = payload.get("expense", {})
    return Expense(
        id="e_1",
        trip_id=trip_id,
        description=str(expense.get("description", "Expense")),
        amount=float(expense.get("amount", 0)),
        date=datetime.utcnow(),
        category=str(expense.get("category", "Others")),
        paid_by=str(expense.get("paidBy", "")),
        split_among=expense.get("splitAmong") or [],
        is_payment=bool(expense.get("isPayment")) if "isPayment" in expense else None,
    )


@router.patch("/{trip_id}/expenses/{expense_id}")
def update_expense(_trip_id: str, _expense_id: str, _payload: UpdateExpenseRequest, _user_id: str = Depends(get_current_user_id)) -> None:
    return None


@router.delete("/{trip_id}/expenses/{expense_id}")
def delete_expense(_trip_id: str, _expense_id: str, _user_id: str = Depends(get_current_user_id)) -> None:
    return None
