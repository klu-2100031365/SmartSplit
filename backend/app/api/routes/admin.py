from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import User as UserModel
from app.schemas.auth import User

router = APIRouter(prefix="/admin")

@router.get("/users", response_model=list[User])
def list_users(db: Session = Depends(get_db)):
    # In a real app, we'd check if the current user is an admin here
    # For now, we return all users as requested
    users = db.query(UserModel).all()
    return users

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete an admin user")
    
    db.delete(user)
    db.commit()
    return {"ok": True}
