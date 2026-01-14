from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict
from src.models.user import UserCreate, UserRead
from src.services.user_service import create_user, authenticate_user, validate_password_strength
from src.api.database import get_session
from src.middleware.jwt_auth_middleware import jwt_auth
import re


auth_router = APIRouter()


def validate_email_format(email: str) -> bool:
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@auth_router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, session: Session = Depends(get_session)):
    """Register a new user"""
    # Validate email format
    if not validate_email_format(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    # Validate password strength
    if not validate_password_strength(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit"
        )

    try:
        db_user = create_user(user, session)
        return db_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )


@auth_router.post("/login", response_model=Dict[str, str])
def login(user_credentials: UserCreate, session: Session = Depends(get_session)):
    """Authenticate user and return JWT token"""
    # Validate email format
    if not validate_email_format(user_credentials.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    user = authenticate_user(user_credentials.email, user_credentials.password, session)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = jwt_auth.create_access_token(str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }