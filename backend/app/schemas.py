from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional, Literal


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(default="intern", pattern="^(intern|junior|middle|senior|lead)$")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


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
    password: str = Field(..., min_length=1)


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

    @classmethod
    def from_orm(cls, obj):
        # Convert JSON string resources to list
        import json
        data = {
            "id": obj.id,
            "title": obj.title,
            "description": obj.description,
            "direction": obj.direction,
            "resources": json.loads(obj.resources) if obj.resources else [],
            "checkpoint": obj.checkpoint,
            "children": [cls.from_orm(child) for child in obj.children]
        }
        return cls(**data)


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


# --- Team & Corporate Schemas ---

class TeamStats(BaseModel):
    active_developers: int
    active_projects: int
    average_experience: float
    monthly_releases: int


class ProfessionOut(BaseModel):
    id: str
    title: str
    level: int
    accent: str
    subtitle: str
    description: str


class CorporateDashboard(BaseModel):
    active_tasks: int
    code_reviews: int
    daily_commits: int
    learning_modules: int


class UserSettings(BaseModel):
    profession: Optional[str] = None
    preferences: Optional[dict] = None


class UserSettingsUpdate(BaseModel):
    profession: Optional[str] = None
    preferences: Optional[dict] = None
