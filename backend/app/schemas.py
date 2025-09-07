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
    def model_validate(cls, obj, **kwargs):
        # Convert JSON string resources to list
        import json
        if hasattr(obj, 'resources') and obj.resources:
            try:
                resources = json.loads(obj.resources) if isinstance(obj.resources, str) else obj.resources
            except (json.JSONDecodeError, TypeError):
                resources = []
        else:
            resources = []
        
        # Create data dict with converted resources
        data = {
            "id": obj.id,
            "title": obj.title,
            "description": obj.description or "",
            "direction": obj.direction,
            "resources": resources,
            "checkpoint": obj.checkpoint,
            "children": [cls.model_validate(child) for child in obj.children] if hasattr(obj, 'children') else []
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
    is_active: bool

    model_config = {
        "from_attributes": True
    }


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
