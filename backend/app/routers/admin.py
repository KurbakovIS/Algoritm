from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas, deps
from ..db import get_db

router = APIRouter(
    prefix="/admin/roadmap",
    tags=["admin-roadmap"],
    # dependencies=[Depends(deps.get_current_admin_user)]  # TODO: добавить проверку админа
)


@router.get("/nodes", response_model=List[schemas.RoadmapNodeOut])
def get_all_nodes_admin(db: Session = Depends(get_db)):
    """
    Получение всех узлов для админки.
    """
    return crud.get_all_nodes_with_blocks(db)


@router.post("/nodes/by-ids", response_model=List[schemas.RoadmapNodeOut])
def get_nodes_by_ids(node_ids: schemas.NodeIdsRequest, db: Session = Depends(get_db)):
    """
    Получение узлов по списку ID.
    """
    try:
        return crud.get_nodes_by_ids(db, node_ids.node_ids)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/nodes", response_model=schemas.RoadmapNodeOut)
def create_node_admin(node: schemas.RoadmapNodeCreate, db: Session = Depends(get_db)):
    """
    Создание нового узла.
    """
    try:
        return crud.create_node_with_blocks(db, node)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/nodes/{node_id}", response_model=schemas.RoadmapNodeOut)
def update_node_admin(node_id: int, node: schemas.RoadmapNodeCreate, db: Session = Depends(get_db)):
    """
    Обновление узла.
    """
    try:
        return crud.update_node_with_blocks(db, node_id, node)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/nodes/{node_id}")
def delete_node_admin(node_id: int, db: Session = Depends(get_db)):
    """
    Удаление узла.
    """
    success = crud.delete_node_cascade(db, node_id)
    if not success:
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node deleted successfully"}


@router.get("/nodes/{node_id}/dependencies", response_model=List[schemas.RoadmapNodeOut])
def get_node_dependencies(node_id: int, db: Session = Depends(get_db)):
    """
    Получение зависимостей узла.
    """
    return crud.get_node_dependencies(db, node_id)


@router.get("/nodes/{node_id}/availability/{user_id}")
def check_node_availability(node_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Проверка доступности узла для пользователя.
    """
    return crud.check_node_availability(db, node_id, user_id)


@router.post("/blocks", response_model=schemas.NodeBlockOut)
def create_block(block: schemas.NodeBlockCreate, db: Session = Depends(get_db)):
    """
    Создание блокировки между узлами.
    """
    try:
        return crud.create_node_block(db, block)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/blocks/{block_id}")
def delete_block(block_id: int, db: Session = Depends(get_db)):
    """
    Удаление блокировки.
    """
    success = crud.delete_node_block(db, block_id)
    if not success:
        raise HTTPException(status_code=404, detail="Block not found")
    return {"message": "Block deleted successfully"}
