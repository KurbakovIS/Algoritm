from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..db import get_db
from ..deps import get_current_user

router = APIRouter(
    prefix="/team",
    tags=["team"],
)


@router.get("/stats", response_model=schemas.TeamStats)
def get_team_stats(db: Session = Depends(get_db)):
    """
    Get team statistics.
    """
    return crud.get_team_stats(db)


@router.get("/professions", response_model=List[schemas.ProfessionOut])
def get_professions(db: Session = Depends(get_db)):
    """
    Get available professions/directions.
    """
    return crud.get_professions(db)
