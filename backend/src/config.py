from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database settings
    database_url: str = Field(default=...)

    # Authentication settings
    better_auth_secret: str = Field(default=...)
    frontend_url: str = Field(default="http://localhost:3000")

    # JWT settings
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS settings
    allowed_origins: List[str] = Field(default=["http://localhost:3000", "http://localhost:3001"])

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False
    }


def get_settings() -> Settings:
    """Get application settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()


# Validate settings on startup
def validate_settings():
    """Validate that required settings are properly configured"""
    if not settings.database_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    if not settings.better_auth_secret:
        raise ValueError("BETTER_AUTH_SECRET environment variable is not set")

    if len(settings.better_auth_secret) < 32:
        raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters long")