from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
import json

from app.api.deps import get_current_user_id, get_db
from app.schemas.daily_expenses import SalaryResponse, UpdateSalaryRequest
from app.schemas.me import UserProfileData, UpdateProfileRequest

router = APIRouter(prefix="/me")


@router.get("/salary", response_model=SalaryResponse)
def get_salary(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> SalaryResponse:
    from app.models import User

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return SalaryResponse(monthly_salary=user.monthly_salary)


@router.put("/salary")
def update_salary(
    payload: UpdateSalaryRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> None:
    from app.models import User

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.monthly_salary = payload.monthly_salary
    db.commit()


@router.get("/trip-shares", response_model=dict[str, float])
def get_trip_shares(_user_id: str = Depends(get_current_user_id)) -> dict[str, float]:
    return {}


@router.get("/profile", response_model=UserProfileData)
def get_profile(
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_current_user_id)
) -> UserProfileData:
    from app.models import User, Trip, Expense, Participant

    user_model = db.query(User).filter(User.id == user_id).first()
    if not user_model:
        raise HTTPException(status_code=404, detail="User not found")

    notif_settings = {}
    if user_model.notification_settings:
        try:
            notif_settings = json.loads(user_model.notification_settings)
        except Exception:
            notif_settings = {}

    # Skip Trip.custom_image blobs — they make this endpoint hang on large trips.
    trip_rows = (
        db.query(Trip.id, Trip.name, Trip.created_at)
        .filter(Trip.owner_id == user_id)
        .order_by(Trip.created_at.desc())
        .all()
    )
    trip_ids = [row.id for row in trip_rows]

    totals: dict[str, float] = {}
    participant_counts: dict[str, int] = {}
    if trip_ids:
        totals = dict(
            db.query(
                Expense.trip_id,
                func.coalesce(func.sum(Expense.amount), 0.0),
            )
            .filter(
                Expense.trip_id.in_(trip_ids),
                or_(Expense.is_payment.is_(False), Expense.is_payment.is_(None)),
            )
            .group_by(Expense.trip_id)
            .all()
        )
        participant_counts = dict(
            db.query(Participant.trip_id, func.count(Participant.id))
            .filter(Participant.trip_id.in_(trip_ids))
            .group_by(Participant.trip_id)
            .all()
        )

    trip_summaries = []
    for row in trip_rows:
        created = row.created_at.strftime("%Y-%m-%d") if row.created_at else ""
        trip_summaries.append({
            "id": row.id,
            "name": row.name,
            "date": created,
            "total_cost": float(totals.get(row.id, 0) or 0),
            "user_share": 0.0,
            "participant_count": int(participant_counts.get(row.id, 0) or 0),
        })

    return UserProfileData(
        name=user_model.name,
        email=user_model.email,
        profile_image_url=user_model.profile_image_url,
        phone_number=user_model.phone_number,
        default_currency=user_model.default_currency,
        timezone=user_model.timezone,
        language=user_model.language,
        notification_settings=notif_settings,
        trips=trip_summaries,
        expenses=[],
    )


@router.put("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
) -> None:
    from app.models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if payload.name is not None: user.name = payload.name
    if payload.phone_number is not None: user.phone_number = payload.phone_number
    if payload.default_currency is not None: user.default_currency = payload.default_currency
    if payload.timezone is not None: user.timezone = payload.timezone
    if payload.language is not None: user.language = payload.language
    
    if payload.notification_settings is not None:
        user.notification_settings = json.dumps(payload.notification_settings)
        
    db.commit()
    return None
