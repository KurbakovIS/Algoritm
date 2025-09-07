from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine, SessionLocal
from .models import *  # noqa: F401
from .routers import auth as auth_router
from .routers import roadmap as roadmap_router
from .routers import progress as progress_router
from .seed import seed


app = FastAPI(title="Gamified Roadmap Platform (MVP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


app.include_router(auth_router.router)
app.include_router(roadmap_router.router)
app.include_router(progress_router.router)


@app.get("/")
def root():
    return {"status": "ok", "name": "Gamified Roadmap Platform"}

