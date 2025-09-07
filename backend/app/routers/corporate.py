from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..db import get_db

router = APIRouter(
    prefix="/corporate",
    tags=["corporate"],
)


@router.get("/dashboard", response_model=schemas.CorporateDashboard)
def get_corporate_dashboard(db: Session = Depends(get_db)):
    """
    Get corporate dashboard data.
    """
    return crud.get_corporate_dashboard(db)
