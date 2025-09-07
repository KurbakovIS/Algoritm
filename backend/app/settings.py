from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    test_database_url: Optional[str] = None
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_alg: str = "HS256"
    jwt_exp_seconds: int = 86400
    pwd_salt: str = "dev-salt-change-in-production"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    log_level: str = "INFO"

    class Config:
        env_file = "../.env"


settings = Settings()
