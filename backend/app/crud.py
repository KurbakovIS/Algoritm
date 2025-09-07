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
