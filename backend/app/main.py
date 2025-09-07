from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .db import Base, engine, SessionLocal
from .models import *  # noqa: F401
from .routers import auth as auth_router
from .routers import roadmap as roadmap_router
from .routers import progress as progress_router
from .routers import team as team_router
from .routers import corporate as corporate_router
from .routers import user as user_router
from .routers import admin as admin_router
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
    yield
    # Shutdown (cleanup if needed)
    pass


app = FastAPI(title="Gamified Roadmap Platform (MVP)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router.router)
app.include_router(roadmap_router.router)
app.include_router(progress_router.router)
app.include_router(team_router.router)
app.include_router(corporate_router.router)
app.include_router(user_router.router)
app.include_router(admin_router.router)


@app.get("/")
def root():
    return {"status": "ok", "name": "Gamified Roadmap Platform"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring and load balancers"""
    try:
        # Проверяем подключение к базе данных
        db = SessionLocal()
        try:
            # Выполняем простой запрос для проверки БД
            db.execute(text("SELECT 1"))
            db_status = "healthy"
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        finally:
            db.close()
        
        # Определяем общий статус
        overall_status = "healthy" if db_status == "healthy" else "unhealthy"
        
        return {
            "status": overall_status,
            "service": "gamified-roadmap-backend",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "checks": {
                "database": db_status
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "service": "gamified-roadmap-backend",
                "version": "1.0.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "error": str(e)
            }
        )

