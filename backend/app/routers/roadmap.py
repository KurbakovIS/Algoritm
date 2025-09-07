from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import RoadmapNode
from ..schemas import RoadmapNodeOut


router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.get("/directions", response_model=List[str])
def get_directions(db: Session = Depends(get_db)):
    rows = db.query(RoadmapNode.direction).distinct().all()
    return [r[0] for r in rows]


@router.get("/{direction}", response_model=List[RoadmapNodeOut])
def get_direction_nodes(direction: str, db: Session = Depends(get_db)):
    # FastAPI typing quirk: we'll annotate via pydantic model; but for MVP keep simple
    nodes = db.query(RoadmapNode).filter(RoadmapNode.direction == direction).all()
    # Parse resources JSON string to list for schema
    out: List[RoadmapNodeOut] = []
    import json
    for n in nodes:
        out.append(
            RoadmapNodeOut(
                id=n.id,
                direction=n.direction,
                title=n.title,
                description=n.description or "",
                resources=json.loads(n.resources or "[]"),
                parent_id=n.parent_id,
                checkpoint=bool(n.checkpoint),
            )
        )
    return out


@router.get("/node/{node_id}", response_model=RoadmapNodeOut)
def get_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(RoadmapNode).get(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    import json
    return RoadmapNodeOut(
        id=node.id,
        direction=node.direction,
        title=node.title,
        description=node.description or "",
        resources=json.loads(node.resources or "[]"),
        parent_id=node.parent_id,
        checkpoint=bool(node.checkpoint),
    )
