from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..db import get_db

router = APIRouter(
    prefix="/roadmap",
    tags=["roadmap"],
)


@router.get("/", response_model=List[schemas.RoadmapNodeOut])
def read_roadmap_nodes(db: Session = Depends(get_db)):
    """
    Retrieve all roadmap nodes.
    """
    nodes = crud.get_all_nodes(db)
    return nodes


@router.get("/directions", response_model=List[str])
def get_directions(db: Session = Depends(get_db)):
    """
    Get all available directions.
    """
    directions = db.query(models.RoadmapNode.direction).distinct().all()
    return [d[0] for d in directions]


@router.get("/directions/{direction}", response_model=List[schemas.RoadmapNodeOut])
def get_nodes_by_direction(direction: str, db: Session = Depends(get_db)):
    """
    Get root nodes for a specific direction with their children hierarchy.
    """
    nodes = crud.get_root_nodes_by_direction(db, direction)
    return nodes


@router.get("/node/{node_id}", response_model=schemas.RoadmapNodeOut)
def get_node(node_id: int, db: Session = Depends(get_db)):
    """
    Get a specific node by ID.
    """
    node = crud.get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.post("/", response_model=schemas.RoadmapNodeOut)
def create_roadmap_node(node: schemas.RoadmapNodeCreate, db: Session = Depends(get_db)):
    """
    Create a new roadmap node.
    """
    return crud.create_node(db=db, node=node)
