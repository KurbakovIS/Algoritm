from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import Progress, RoadmapNode, User
from ..schemas import ProgressUpdate, ProgressOut
from ..deps import get_current_user
import json


router = APIRouter(prefix="/progress", tags=["progress"])


def _award_xp_and_badges(user: User, delta_xp: int):
    user.xp += max(0, delta_xp)
    badges = json.loads(user.badges or "[]")
    thresholds = [(100, "Apprentice"), (300, "Journeyman"), (600, "Adept"), (1000, "Master")]
    for t, name in thresholds:
        if user.xp >= t and name not in badges:
            badges.append(name)
    user.badges = json.dumps(badges)


@router.post("/update", response_model=ProgressOut)
def update_progress(
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = db.query(RoadmapNode).get(payload.node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    prog = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id, Progress.node_id == node.id)
        .first()
    )
    if not prog:
        prog = Progress(user_id=current_user.id, node_id=node.id)
        db.add(prog)

    completed_before = prog.status == "completed"
    prog.status = payload.status
    prog.score = payload.score

    # XP rule: completing a node grants base XP; checkpoint grants extra
    base_xp = 20
    extra_checkpoint = 30 if node.checkpoint else 0
    score_bonus = max(0, min(payload.score, 100)) // 10  # up to +10

    if payload.status == "completed" and not completed_before:
        _award_xp_and_badges(current_user, base_xp + extra_checkpoint + score_bonus)

    db.commit()
    db.refresh(prog)
    return ProgressOut.from_orm(prog)


@router.get("/mine", response_model=List[ProgressOut])
def my_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(Progress).filter(Progress.user_id == current_user.id).all()
    return [ProgressOut.from_orm(p) for p in rows]

