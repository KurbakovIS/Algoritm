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


@router.post("/", response_model=schemas.RoadmapNodeOut)
def create_roadmap_node(node: schemas.RoadmapNodeCreate, db: Session = Depends(get_db)):
    """
    Create a new roadmap node.
    """
    return crud.create_node(db=db, node=node)
