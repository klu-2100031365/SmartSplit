from pydantic import BaseModel, EmailStr

from app.schemas.common import APIModel


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class User(APIModel):
    id: str
    name: str
    email: EmailStr
    monthly_salary: float | None = None


class AuthResponse(APIModel):
    user: User
    token: str
