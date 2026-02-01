from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


def _to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class APIModel(BaseModel):
    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "alias_generator": _to_camel,
    }


class ChartSlice(APIModel):
    label: str
    value: float
    color: str


class ChartBar(APIModel):
    label: str
    value: float


class MoneyStats(APIModel):
    paid: float
    share: float
    received: float


class ChangeLog(APIModel):
    id: str
    trip_id: str
    actor_name: str
    action: str
    item_type: str
    item_id: str
    description: str
    timestamp: datetime
    previous_data: Any | None = None
    current_data: Any | None = None
