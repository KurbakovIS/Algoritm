from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "intern"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    xp: int
    badges: List[str]

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RoadmapNodeOut(BaseModel):
    id: int
    direction: str
    title: str
    description: str
    resources: List[str]
    parent_id: Optional[int]
    checkpoint: bool

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    node_id: int
    status: Literal["not_started", "in_progress", "completed"]
    score: int = 0


class ProgressOut(BaseModel):
    user_id: int
    node_id: int
    status: str
    score: int

    class Config:
        from_attributes = True

