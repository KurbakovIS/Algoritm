from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User
from ..schemas import UserCreate, LoginRequest, Token, UserOut
from ..auth import hash_password, verify_password, create_jwt
import json
from ..deps import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        xp=0,
        badges=json.dumps([]),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Convert badges JSON new_string to list for schema
    out = UserOut(
        id=user.id,
        email=user.email,
        role=user.role,
        xp=user.xp,
        badges=json.loads(user.badges),
    )
    return out


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # For demo purposes, create user on login if not exists
        user = User(
            email=payload.email,
            password_hash=hash_password(payload.password),
            role="intern",
            xp=0,
            badges=json.dumps([]),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    # Always succeed for demo
    token = create_jwt(str(user.id), {"role": user.role})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).get(current_user.id)
    import json as _json

    return UserOut(
        id=user.id,
        email=user.email,
        role=user.role,
        xp=user.xp,
        badges=_json.loads(user.badges or "[]"),
    )
