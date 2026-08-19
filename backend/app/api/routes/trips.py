from datetime import datetime
from typing import List, Dict, Any
import json
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_id
from app.models import Trip as TripModel, Participant as ParticipantModel, Expense as ExpenseModel
from app.schemas.trips import (
    AnalyticsData,
    CreateParticipantRequest,
    CreateTripRequest,
    Expense,
    Participant,
    SettlementSummary,
    Trip,
    TripDetailsView,
    UpdateExpenseRequest,
    UpdateTripRequest,
    Settlement,
)

router = APIRouter(prefix="/trips")

def calculate_analytics(participants: List[ParticipantModel], expenses: List[ExpenseModel]) -> Dict[str, Any]:
    total_cost = sum(e.amount for e in expenses if not e.is_payment)
    
    cat_sums = defaultdict(float)
    cat_involved = defaultdict(lambda: defaultdict(float))
    for e in expenses:
        if e.is_payment: continue
        cat_sums[e.category] += e.amount
        split_list = json.loads(e.split_among) if e.split_among else []
        if not split_list: continue
        share = e.amount / len(split_list)
        for pid in split_list:
            p_name = next((p.name for p in participants if p.id == pid), "Unknown")
            cat_involved[e.category][p_name] += share

    daily_sums = defaultdict(float)
    for e in expenses:
        if e.is_payment: continue
        d = e.date.isoformat()[:10]
        daily_sums[d] += e.amount
    
    paid_totals = defaultdict(float)
    share_totals = defaultdict(float)
    payer_categories = defaultdict(lambda: defaultdict(float))
    participant_indiv_cat_stats = defaultdict(lambda: defaultdict(float))
    
    for e in expenses:
        if e.is_payment: continue
        
        # Handle multiple payers
        try:
            payers = json.loads(e.paid_by) if e.paid_by.startswith('[') else [e.paid_by]
        except:
            payers = [e.paid_by]
            
        payer_share = e.amount / len(payers)
        for pid in payers:
            paid_totals[pid] += payer_share
            payer_categories[pid][e.category] += payer_share

        split_list = json.loads(e.split_among) if e.split_among else []
        if split_list:
            share = e.amount / len(split_list)
            for pid in split_list:
                share_totals[pid] += share
                participant_indiv_cat_stats[pid][e.category] += share

    category_stats = []
    for cat, total in cat_sums.items():
        category_stats.append({
            "category": cat,
            "total": total,
            "involved": dict(cat_involved[cat])
        })
        
    # ChartBar: label, value
    daily_stats = [{"label": d, "value": a} for d, a in sorted(daily_sums.items())]
    
    total_payer_stats = []
    for p in participants:
        total_payer_stats.append({
            "id": p.id,
            "name": p.name,
            "amount": paid_totals[p.id],
            "categories": list(payer_categories[p.id].items())
        })
        
    individual_share_stats = []
    for p in participants:
        individual_share_stats.append({
            "participant": {"id": p.id, "name": p.name, "trip_id": p.trip_id},
            "total": share_totals[p.id],
            "categories": list(participant_indiv_cat_stats[p.id].items())
        })

    # ChartSlice: label, value, color
    colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
    participant_stats = []
    for i, p in enumerate(participants):
        participant_stats.append({
            "label": p.name,
            "value": share_totals[p.id],
            "color": colors[i % len(colors)]
        })

    return {
        "total_trip_cost": total_cost,
        "category_stats": category_stats,
        "daily_stats": daily_stats,
        "participant_stats": participant_stats,
        "total_payer_stats": total_payer_stats,
        "individual_share_stats": individual_share_stats,
    }

def calculate_settlements(participants: List[ParticipantModel], expenses: List[ExpenseModel]) -> Dict[str, Any]:
    balances = defaultdict(float)
    stats = defaultdict(lambda: {"paid": 0.0, "share": 0.0, "received": 0.0})

    for e in expenses:
        if e.is_payment:
            try:
                payers = json.loads(e.paid_by) if e.paid_by.startswith('[') else [e.paid_by]
            except:
                payers = [e.paid_by]
            
            target_ids = json.loads(e.split_among) if e.split_among else []
            if target_ids and payers:
                from_id = payers[0]
                to_id = target_ids[0]
                balances[from_id] += e.amount
                balances[to_id] -= e.amount
                stats[from_id]["received"] += e.amount
            continue

        try:
            payers = json.loads(e.paid_by) if e.paid_by.startswith('[') else [e.paid_by]
        except:
            payers = [e.paid_by]
        
        payer_share = e.amount / len(payers)
        for pid in payers:
            balances[pid] += payer_share
            stats[pid]["paid"] += payer_share
        
        split_list = json.loads(e.split_among) if e.split_among else []
        if split_list:
            share = e.amount / len(split_list)
            for pid in split_list:
                balances[pid] -= share
                stats[pid]["share"] += share

    positives = []
    negatives = []
    for pid, bal in balances.items():
        if bal > 0.01: positives.append([pid, bal])
        elif bal < -0.01: negatives.append([pid, -bal])
        
    settlements = []
    pos_idx = 0
    neg_idx = 0
    while pos_idx < len(positives) and neg_idx < len(negatives):
        p_id, p_amt = positives[pos_idx]
        n_id, n_amt = negatives[neg_idx]
        
        amount = min(p_amt, n_amt)
        p_name = next((p.name for p in participants if p.id == p_id), "Unknown")
        n_name = next((p.name for p in participants if p.id == n_id), "Unknown")
        
        settlements.append({
            "from": n_name,
            "from_id": n_id,
            "to": p_name,
            "to_id": p_id,
            "amount": amount
        })
        
        positives[pos_idx][1] -= amount
        negatives[neg_idx][1] -= amount
        
        if positives[pos_idx][1] < 0.01: pos_idx += 1
        if negatives[neg_idx][1] < 0.01: neg_idx += 1

    return {
        "settlements": settlements,
        "stats": dict(stats),
        "balances": dict(balances)
    }

@router.get("", response_model=List[Trip])
def list_trips(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> List[Trip]:
    trips = db.query(TripModel).filter(TripModel.owner_id == current_user_id).all()
    # Pydantic v2 uses model_validate, but APIModel might be different. 
    # Let's try simpler list comprehension
    return trips


@router.post("", response_model=Trip)
def create_trip(payload: CreateTripRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> Trip:
    new_trip = TripModel(
        name=payload.name,
        owner_id=current_user_id,
        icon=payload.icon,
        custom_image=payload.custom_image,
        type=payload.type or "trip",
        currency=payload.currency or "INR"
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip


@router.patch("/{trip_id}")
def update_trip(trip_id: str, payload: UpdateTripRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> None:
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip or trip.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this trip")
    
    if payload.name is not None: trip.name = payload.name
    if payload.icon is not None: trip.icon = payload.icon
    if payload.custom_image is not None: trip.custom_image = payload.custom_image
    if payload.currency is not None: trip.currency = payload.currency
    
    db.commit()
    return None


@router.get("/{trip_id}/view", response_model=TripDetailsView)
def trip_view(trip_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> TripDetailsView:
    trip_model = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip_model:
        raise HTTPException(status_code=404, detail="Trip not found")

    participants = db.query(ParticipantModel).filter(ParticipantModel.trip_id == trip_id).all()
    expenses = db.query(ExpenseModel).filter(ExpenseModel.trip_id == trip_id).all()

    schema_expenses = []
    groups = defaultdict(list)
    
    for e in expenses:
        try:
            split_among = json.loads(e.split_among) if e.split_among else []
        except:
            split_among = []
        
        # Pydantic will handle model to schema conversion if we return dict or model
        schema_exp = {
            "id": e.id,
            "trip_id": e.trip_id,
            "description": e.description,
            "amount": e.amount,
            "date": e.date,
            "category": e.category,
            "paid_by": json.loads(e.paid_by) if e.paid_by and e.paid_by.startswith('[') else [e.paid_by],
            "split_among": split_among,
            "is_payment": e.is_payment
        }
        schema_expenses.append(schema_exp)
        
        date_str = e.date.isoformat()[:10] if hasattr(e.date, 'isoformat') else str(e.date)[:10]
        groups[date_str].append(schema_exp)

    settlement_data = calculate_settlements(participants, expenses)
    analytics = calculate_analytics(participants, expenses)

    return {
        "trip": trip_model,
        "participants": participants,
        "expenses": schema_expenses,
        "logs": [],
        "settlement_data": settlement_data,
        "daily_balances": [],
        "grouped_expenses": sorted(groups.items(), key=lambda x: x[0], reverse=True),
        "analytics_data": analytics,
        "user_share": 0.0,
        "share_token": None,
        "share_permission": None,
    }


@router.post("/{trip_id}/participants", response_model=Participant)
def add_participant(trip_id: str, payload: CreateParticipantRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> Participant:
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip or trip.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to add participants to this trip")
    
    new_participant = ParticipantModel(trip_id=trip_id, name=payload.name)
    db.add(new_participant)
    db.commit()
    db.refresh(new_participant)
    return new_participant


@router.post("/{trip_id}/expenses", response_model=Expense)
def add_expense(trip_id: str, payload: dict, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> Expense:
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip or trip.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to add expenses to this trip")

    expense_data = payload.get("expense", payload)
    
    date_val = datetime.utcnow()
    raw_date = expense_data.get("date")
    if raw_date:
        try:
            date_val = datetime.fromisoformat(raw_date.replace('Z', '+00:00'))
        except:
             pass

    new_expense = ExpenseModel(
        trip_id=trip_id,
        description=expense_data.get("description", "Expense"),
        amount=float(expense_data.get("amount", 0)),
        date=date_val,
        category=expense_data.get("category", "Others"),
        paid_by=json.dumps(expense_data.get("paidBy", [])),
        split_among=json.dumps(expense_data.get("splitAmong", [])),
        is_payment=expense_data.get("isPayment", False)
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    
    return {
        "id": new_expense.id,
        "trip_id": new_expense.trip_id,
        "description": new_expense.description,
        "amount": new_expense.amount,
        "date": new_expense.date,
        "category": new_expense.category,
        "paid_by": json.loads(new_expense.paid_by) if new_expense.paid_by and new_expense.paid_by.startswith('[') else [new_expense.paid_by],
        "split_among": json.loads(new_expense.split_among) if new_expense.split_among else [],
        "is_payment": new_expense.is_payment
    }

@router.patch("/{trip_id}/expenses/{expense_id}")
def update_expense(trip_id: str, expense_id: str, payload: UpdateExpenseRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> None:
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip or trip.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this trip")
    
    exp = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    data = payload.data
    if "description" in data: exp.description = data["description"]
    if "amount" in data: exp.amount = float(data["amount"])
    if "category" in data: exp.category = data["category"]
    if "date" in data: 
        try:
            exp.date = datetime.fromisoformat(data["date"].replace('Z', '+00:00'))
        except:
            pass
    if "paidBy" in data: exp.paid_by = json.dumps(data["paidBy"])
    if "splitAmong" in data: exp.split_among = json.dumps(data["splitAmong"])
    if "isPayment" in data: exp.is_payment = data["isPayment"]
    
    db.commit()
    return None

@router.delete("/{trip_id}/participants/{participant_id}")
def remove_participant(trip_id: str, participant_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> None:
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip or trip.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this trip")

    part = db.query(ParticipantModel).filter(ParticipantModel.id == participant_id).first()
    if part:
        db.delete(part)
        db.commit()
    return None

@router.delete("/{trip_id}/expenses/{expense_id}")
def delete_expense(trip_id: str, expense_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)) -> None:
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip or trip.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this trip")

    exp = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if exp:
        db.delete(exp)
        db.commit()
    return None
