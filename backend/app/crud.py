from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_node(db: Session, node_id: int) -> Optional[schemas.RoadmapNodeOut]:
    """
    Retrieves a single roadmap node by its ID.
    """
    node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == node_id).first()
    if not node:
        return None
    return schemas.RoadmapNodeOut.model_validate(node)


def get_all_nodes(db: Session) -> List[schemas.RoadmapNodeOut]:
    """
    Retrieves all roadmap nodes.
    """
    nodes = db.query(models.RoadmapNode).all()
    return [schemas.RoadmapNodeOut.model_validate(node) for node in nodes]


def get_nodes_by_direction(db: Session, direction: str) -> List[schemas.RoadmapNodeOut]:
    """
    Retrieves all roadmap nodes for a specific direction.
    """
    nodes = db.query(models.RoadmapNode).filter(models.RoadmapNode.direction == direction).all()
    return [schemas.RoadmapNodeOut.model_validate(node) for node in nodes]


def get_root_nodes_by_direction(db: Session, direction: str) -> List[schemas.RoadmapNodeOut]:
    """
    Retrieves only root nodes (nodes without parents) for a specific direction.
    """
    # Получаем все узлы для направления
    all_nodes = db.query(models.RoadmapNode).filter(models.RoadmapNode.direction == direction).all()
    
    # Фильтруем только корневые узлы (те, у которых нет родителей)
    root_nodes = []
    for node in all_nodes:
        # Проверяем, не является ли этот узел дочерним для какого-либо другого узла
        is_child = False
        for other_node in all_nodes:
            if other_node.children and any(child.id == node.id for child in other_node.children):
                is_child = True
                break
        
        if not is_child:
            root_nodes.append(node)
    
    return [schemas.RoadmapNodeOut.model_validate(node) for node in root_nodes]


def create_node(db: Session, node: schemas.RoadmapNodeCreate) -> schemas.RoadmapNodeOut:
    """
    Creates a new roadmap node and links it to parent nodes if specified.
    """
    import json
    db_node = models.RoadmapNode(
        title=node.title,
        description=node.description,
        direction=node.direction,
        resources=json.dumps(node.resources),  # Store as JSON string
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

    return schemas.RoadmapNodeOut.model_validate(db_node)


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


def get_professions(db: Session) -> List[schemas.ProfessionOut]:
    """
    Get available professions/directions from database.
    """
    professions = db.query(models.Profession).all()
    return [schemas.ProfessionOut.model_validate(profession) for profession in professions]


def create_profession(db: Session, profession: schemas.ProfessionOut) -> schemas.ProfessionOut:
    """
    Create a new profession.
    """
    db_profession = models.Profession(
        id=profession.id,
        title=profession.title,
        level=profession.level,
        accent=profession.accent,
        subtitle=profession.subtitle,
        description=profession.description,
        is_active=profession.is_active
    )
    db.add(db_profession)
    db.commit()
    db.refresh(db_profession)
    return schemas.ProfessionOut.model_validate(db_profession)


def update_profession_status(db: Session, profession_id: str, is_active: bool) -> schemas.ProfessionOut:
    """
    Update profession active status.
    """
    profession = db.query(models.Profession).filter(models.Profession.id == profession_id).first()
    if not profession:
        raise ValueError("Profession not found")
    
    profession.is_active = is_active
    db.commit()
    db.refresh(profession)
    return schemas.ProfessionOut.model_validate(profession)


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
