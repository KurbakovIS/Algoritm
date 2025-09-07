from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_node(db: Session, node_id: int) -> Optional[models.RoadmapNode]:
    """
    Retrieves a single roadmap node by its ID.
    """
    return db.query(models.RoadmapNode).filter(models.RoadmapNode.id == node_id).first()


def get_all_nodes(db: Session) -> List[models.RoadmapNode]:
    """
    Retrieves all roadmap nodes.
    """
    return db.query(models.RoadmapNode).all()


def get_nodes_by_direction(db: Session, direction: str) -> List[models.RoadmapNode]:
    """
    Retrieves all roadmap nodes for a specific direction.
    """
    return db.query(models.RoadmapNode).filter(models.RoadmapNode.direction == direction).all()


def create_node(db: Session, node: schemas.RoadmapNodeCreate) -> models.RoadmapNode:
    """
    Creates a new roadmap node and links it to parent nodes if specified.
    """
    db_node = models.RoadmapNode(
        title=node.title,
        description=node.description,
        direction=node.direction,
        resources=str(node.resources),  # Storing as JSON string for now
        checkpoint=node.checkpoint,
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)

    if node.parent_ids:
        parents = db.query(models.RoadmapNode).filter(models.RoadmapNode.id.in_(node.parent_ids)).all()
        for parent in parents:
            parent.children.append(db_node)
        db.commit()

    return db_node


# --- Team & Corporate CRUD ---

def get_team_stats(db: Session) -> schemas.TeamStats:
    """
    Get team statistics from database.
    """
    # Count active users (users with XP > 0)
    active_developers = db.query(models.User).filter(models.User.xp > 0).count()
    
    # Count unique directions as active projects
    active_projects = db.query(models.RoadmapNode.direction).distinct().count()
    
    # Calculate average experience based on XP (rough estimation)
    users = db.query(models.User).filter(models.User.xp > 0).all()
    if users:
        average_experience = sum(user.xp for user in users) / len(users) / 100  # Convert XP to years
    else:
        average_experience = 0.0
    
    # Estimate monthly releases based on completed progress
    monthly_releases = db.query(models.Progress).filter(models.Progress.status == "completed").count() // 4
    
    return schemas.TeamStats(
        active_developers=active_developers,
        active_projects=active_projects,
        average_experience=round(average_experience, 1),
        monthly_releases=max(monthly_releases, 1)
    )


def get_professions() -> List[schemas.ProfessionOut]:
    """
    Get available professions/directions.
    """
    professions = [
        schemas.ProfessionOut(
            id="backend",
            title="Backend",
            level=3,
            accent="#2aa84a",
            subtitle="Серверный Разработчик",
            description="Создаёте серверную логику, API и базы данных."
        ),
        schemas.ProfessionOut(
            id="frontend",
            title="Frontend",
            level=3,
            accent="#ff7b00",
            subtitle="Фронтенд Разработчик",
            description="Создаёте интерфейсы и отличный UX."
        ),
        schemas.ProfessionOut(
            id="fullstack",
            title="Fullstack",
            level=5,
            accent="#7b5cff",
            subtitle="Универсальный Разработчик",
            description="От фронта до бэка — полный стек."
        ),
        schemas.ProfessionOut(
            id="devops",
            title="DevOps",
            level=5,
            accent="#00b2ff",
            subtitle="Инженер Инфраструктуры",
            description="CI/CD, контейнеры и стабильность."
        ),
        schemas.ProfessionOut(
            id="mobile",
            title="Mobile",
            level=4,
            accent="#ff3b7f",
            subtitle="Мобильный Разработчик",
            description="iOS/Android и мобильный UX."
        ),
        schemas.ProfessionOut(
            id="data-ml",
            title="Data/ML",
            level=7,
            accent="#f2b705",
            subtitle="Инженер Данных и ИИ",
            description="ML-модели и инсайты из данных."
        ),
    ]
    return professions


def get_corporate_dashboard(db: Session) -> schemas.CorporateDashboard:
    """
    Get corporate dashboard data.
    """
    # Count active tasks (nodes in progress)
    active_tasks = db.query(models.Progress).filter(models.Progress.status == "in_progress").count()
    
    # Estimate code reviews (completed tasks / 2)
    code_reviews = db.query(models.Progress).filter(models.Progress.status == "completed").count() // 2
    
    # Estimate daily commits based on progress updates
    daily_commits = db.query(models.Progress).count() // 10  # Rough estimation
    
    # Count available learning modules (total nodes)
    learning_modules = db.query(models.RoadmapNode).count()
    
    return schemas.CorporateDashboard(
        active_tasks=max(active_tasks, 1),
        code_reviews=max(code_reviews, 1),
        daily_commits=max(daily_commits, 1),
        learning_modules=max(learning_modules, 1)
    )


def get_user_settings(db: Session, user_id: int) -> schemas.UserSettings:
    """
    Get user settings.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return schemas.UserSettings()
    
    # For now, we'll use the user's role as profession
    # In a real app, you'd have a separate settings table
    return schemas.UserSettings(
        profession=user.role,
        preferences={}
    )


def update_user_settings(db: Session, user_id: int, settings: schemas.UserSettingsUpdate) -> schemas.UserSettings:
    """
    Update user settings.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    # For now, we'll update the user's role as profession
    # In a real app, you'd have a separate settings table
    if settings.profession:
        user.role = settings.profession
    
    db.commit()
    db.refresh(user)
    
    return schemas.UserSettings(
        profession=user.role,
        preferences=settings.preferences or {}
    )
