from datetime import datetime

from fastapi import APIRouter

from app.schemas.share import ShareTripResponse
from app.schemas.trips import Participant, Trip

router = APIRouter(prefix="/share")


@router.get("/{token}", response_model=ShareTripResponse)
def get_trip_by_share_token(token: str) -> ShareTripResponse:
    trip = Trip(
        id=f"shared_{token}",
        name="Shared Trip",
        owner_id="user_1",
        created_at=datetime.utcnow(),
        icon="plane",
        custom_image=None,
        share_token=token,
        share_permission="view",
        type="trip",
    )

    participants = [Participant(id="p1", trip_id=trip.id, name="Guest")]
    return ShareTripResponse(trip=trip, participants=participants)
