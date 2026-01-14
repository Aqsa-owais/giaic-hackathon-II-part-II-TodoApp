from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .database import get_session
from ..middleware.jwt_auth_middleware import jwt_auth
from ..config import settings
from ..models.base import create_db_and_tables
import os


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    app = FastAPI(
        title="Backend REST API & Data Layer",
        description="API for task management with JWT authentication and user isolation",
        version="1.0.0"
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    from .task_router import task_router
    from .auth_router import auth_router
    app.include_router(task_router, prefix="/api", tags=["tasks"])
    app.include_router(auth_router, prefix="/api", tags=["auth"])

    # Health check endpoint
    @app.get("/health")
    def health_check():
        return {"status": "healthy", "service": "backend-api"}

    return app


# Create the main application instance
app = create_app()


from ..config import validate_settings


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup"""
    # Validate settings first
    validate_settings()
    create_db_and_tables()