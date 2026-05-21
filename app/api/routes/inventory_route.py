from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.inventory_schema import (
    InventoryCreateSchema,
    InventoryResponseSchema
)

from app.services.inventory_service import (
    create_inventory_movement,
    get_inventory_movements
)

router = APIRouter(
    prefix="/inventory",
    tags=["INVENTORY"]
)


@router.post(
    "/",
    response_model=InventoryResponseSchema
)
def create(
    data: InventoryCreateSchema,
    db: Session = Depends(get_db)
):

    movement = create_inventory_movement(
        db,
        data
    )

    if movement is None:

        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    if movement == "stock_not_enough":

        raise HTTPException(
            status_code=400,
            detail="Stock not enough"
        )

    return movement


@router.get(
    "/",
    response_model=list[InventoryResponseSchema]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_inventory_movements(db)