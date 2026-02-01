from app.schemas.trips import Participant, Trip
from app.schemas.common import APIModel


class ShareTripResponse(APIModel):
    trip: Trip
    participants: list[Participant]
