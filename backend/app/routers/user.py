from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas, models
from ..db import get_db
from ..deps import get_current_user

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.get("/settings", response_model=schemas.UserSettings)
def get_user_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user settings.
    """
    return crud.get_user_settings(db, current_user.id)


@router.post("/settings", response_model=schemas.UserSettings)
def update_user_settings(
    settings: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user settings.
    """
    try:
        return crud.update_user_settings(db, current_user.id, settings)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
