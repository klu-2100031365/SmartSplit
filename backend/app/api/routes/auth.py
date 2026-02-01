from fastapi import APIRouter

from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, User

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest) -> AuthResponse:
    user = User(id="user_1", name=payload.name, email=payload.email, monthly_salary=None)
    return AuthResponse(user=user, token="dev-token")


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    user = User(id="user_1", name="Demo", email=payload.email, monthly_salary=None)
    return AuthResponse(user=user, token="dev-token")
