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


# --- Admin CRUD Operations ---

def create_node_with_blocks(db: Session, node: schemas.RoadmapNodeCreate) -> schemas.RoadmapNodeOut:
    """
    Создание узла с блокировками.
    """
    import json
    db_node = models.RoadmapNode(
        title=node.title,
        description=node.description,
        direction=node.direction,
        resources=json.dumps(node.resources),
        checkpoint=node.checkpoint,
        node_type=node.node_type,
        is_required=node.is_required,
        order_index=node.order_index,
        is_active=node.is_active,
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)

    # Создание связей с родителями
    if node.parent_ids:
        parents = db.query(models.RoadmapNode).filter(models.RoadmapNode.id.in_(node.parent_ids)).all()
        for parent in parents:
            parent.children.append(db_node)
        db.commit()

    # Создание блокировок
    if node.blocking_node_ids:
        for blocking_id in node.blocking_node_ids:
            block = models.NodeBlock(
                blocking_node_id=blocking_id,
                blocked_node_id=db_node.id,
                block_type="required"
            )
            db.add(block)
        db.commit()

    return schemas.RoadmapNodeOut.model_validate(db_node)


def update_node_with_blocks(db: Session, node_id: int, node: schemas.RoadmapNodeCreate) -> schemas.RoadmapNodeOut:
    """
    Обновление узла с блокировками.
    """
    import json
    db_node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == node_id).first()
    if not db_node:
        raise ValueError("Node not found")

    # Обновляем основные поля
    db_node.title = node.title
    db_node.description = node.description
    db_node.direction = node.direction
    db_node.resources = json.dumps(node.resources)
    db_node.checkpoint = node.checkpoint
    db_node.node_type = node.node_type
    db_node.is_required = node.is_required
    db_node.order_index = node.order_index
    db_node.is_active = node.is_active

    # Обновляем связи с родителями
    if node.parent_ids:
        # Удаляем старые связи
        db_node.parents.clear()
        # Добавляем новые
        parents = db.query(models.RoadmapNode).filter(models.RoadmapNode.id.in_(node.parent_ids)).all()
        for parent in parents:
            parent.children.append(db_node)

    # Обновляем блокировки
    if node.blocking_node_ids:
        # Удаляем старые блокировки
        db.query(models.NodeBlock).filter(models.NodeBlock.blocked_node_id == node_id).delete()
        # Добавляем новые
        for blocking_id in node.blocking_node_ids:
            block = models.NodeBlock(
                blocking_node_id=blocking_id,
                blocked_node_id=node_id,
                block_type="required"
            )
            db.add(block)

    db.commit()
    db.refresh(db_node)
    return schemas.RoadmapNodeOut.model_validate(db_node)


def delete_node_cascade(db: Session, node_id: int) -> bool:
    """
    Удаление узла с каскадным удалением связей.
    """
    db_node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == node_id).first()
    if not db_node:
        return False

    # Удаляем блокировки
    db.query(models.NodeBlock).filter(
        (models.NodeBlock.blocking_node_id == node_id) | 
        (models.NodeBlock.blocked_node_id == node_id)
    ).delete()

    # Удаляем связи с родителями
    db_node.parents.clear()
    db_node.children.clear()

    # Удаляем прогресс
    db.query(models.Progress).filter(models.Progress.node_id == node_id).delete()

    # Удаляем сам узел
    db.delete(db_node)
    db.commit()
    return True


def get_node_dependencies(db: Session, node_id: int) -> List[schemas.RoadmapNodeOut]:
    """
    Получение зависимостей узла (узлы, которые блокируют этот узел).
    """
    blocks = db.query(models.NodeBlock).filter(models.NodeBlock.blocked_node_id == node_id).all()
    blocking_nodes = []
    for block in blocks:
        node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == block.blocking_node_id).first()
        if node:
            blocking_nodes.append(schemas.RoadmapNodeOut.model_validate(node))
    return blocking_nodes


def check_node_availability(db: Session, node_id: int, user_id: int) -> dict:
    """
    Проверка доступности узла для пользователя.
    """
    node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == node_id).first()
    if not node:
        return {"available": False, "reason": "Node not found"}
    
    # Получаем все блокировки для этого узла
    blocks = db.query(models.NodeBlock).filter(
        models.NodeBlock.blocked_node_id == node_id
    ).all()
    
    unavailable_reasons = []
    
    for block in blocks:
        # Проверяем статус блокирующего узла
        progress = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.node_id == block.blocking_node_id
        ).first()
        
        if not progress or progress.status != "completed":
            if block.block_type == "required":
                unavailable_reasons.append({
                    "type": "required_block",
                    "blocking_node": block.blocking_node.title,
                    "blocking_node_id": block.blocking_node_id
                })
            else:
                unavailable_reasons.append({
                    "type": "optional_block",
                    "blocking_node": block.blocking_node.title,
                    "blocking_node_id": block.blocking_node_id
                })
    
    return {
        "available": len(unavailable_reasons) == 0,
        "reasons": unavailable_reasons,
        "node": schemas.RoadmapNodeOut.model_validate(node)
    }


def create_node_block(db: Session, block: schemas.NodeBlockCreate) -> schemas.NodeBlockOut:
    """
    Создание блокировки между узлами.
    """
    db_block = models.NodeBlock(
        blocking_node_id=block.blocking_node_id,
        blocked_node_id=block.blocked_node_id,
        block_type=block.block_type
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return schemas.NodeBlockOut.model_validate(db_block)


def delete_node_block(db: Session, block_id: int) -> bool:
    """
    Удаление блокировки.
    """
    block = db.query(models.NodeBlock).filter(models.NodeBlock.id == block_id).first()
    if not block:
        return False
    
    db.delete(block)
    db.commit()
    return True


def get_all_nodes_with_blocks(db: Session) -> List[schemas.RoadmapNodeOut]:
    """
    Получение всех узлов с блокировками для админки.
    """
    nodes = db.query(models.RoadmapNode).all()
    return [schemas.RoadmapNodeOut.model_validate(node) for node in nodes]
