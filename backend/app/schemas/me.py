from app.schemas.common import APIModel


class UserStats(APIModel):
    total_tracked: float
    trip_count: int


class UserProfileData(APIModel):
    trips: list[dict]
    expenses: list[dict]
