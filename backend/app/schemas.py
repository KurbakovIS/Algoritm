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

    model_config = {
        "from_attributes": True
    }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# --- Roadmap Schemas ---

class RoadmapNodeBase(BaseModel):
    title: str
    description: Optional[str] = ""
    direction: str
    resources: List[str] = []
    checkpoint: bool = False


class RoadmapNodeCreate(RoadmapNodeBase):
    parent_ids: Optional[List[int]] = []


class RoadmapNodeOut(RoadmapNodeBase):
    id: int
    children: List['RoadmapNodeOut'] = []

    model_config = {
        "from_attributes": True
    }


class ProgressUpdate(BaseModel):
    node_id: int
    status: Literal["not_started", "in_progress", "completed"]
    score: int = 0


class ProgressOut(BaseModel):
    user_id: int
    node_id: int
    status: str
    score: int

    model_config = {
        "from_attributes": True
    }
