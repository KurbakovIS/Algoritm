from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional, Literal
from datetime import datetime


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
    node_type: str = "task"  # parent, task, optional
    is_required: bool = True
    order_index: int = 0
    is_active: bool = True


class RoadmapNodeCreate(RoadmapNodeBase):
    parent_ids: Optional[List[int]] = []
    blocking_node_ids: Optional[List[int]] = []  # узлы, которые блокируют этот


class RoadmapNodeOut(RoadmapNodeBase):
    id: int
    children: List['RoadmapNodeOut'] = []
    blocked_by: List['NodeBlockOut'] = []
    blocks: List['NodeBlockOut'] = []

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
            "node_type": getattr(obj, 'node_type', 'task'),
            "is_required": getattr(obj, 'is_required', True),
            "order_index": getattr(obj, 'order_index', 0),
            "is_active": getattr(obj, 'is_active', True),
            "children": [cls.model_validate(child) for child in obj.children] if hasattr(obj, 'children') else [],
            "blocked_by": [NodeBlockOut.model_validate(block) for block in obj.blocked_by] if hasattr(obj, 'blocked_by') else [],
            "blocks": [NodeBlockOut.model_validate(block) for block in obj.blocks] if hasattr(obj, 'blocks') else []
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


# --- Node Block Schemas ---

class NodeBlockCreate(BaseModel):
    blocking_node_id: int
    blocked_node_id: int
    block_type: str = "required"  # required, optional


class NodeBlockOut(BaseModel):
    id: int
    blocking_node_id: int
    blocked_node_id: int
    block_type: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
