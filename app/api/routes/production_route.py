from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.production_schema import (
    ProductionCreateSchema,
    ProductionResponseSchema,
    ProductionProgressSchema,
    ProductionProgressResponseSchema
)

from app.services.production_service import (
    create_production_order,
    get_production_orders,
    create_progress,
    get_progress_list
)

router = APIRouter(
    prefix="/production",
    tags=["PRODUCTION"]
)


@router.post(
    "/",
    response_model=ProductionResponseSchema
)
def create(
    data: ProductionCreateSchema,
    db: Session = Depends(get_db)
):

    production = create_production_order(
        db,
        data
    )

    if not production:

        raise HTTPException(
            status_code=404,
            detail="Sales order not found"
        )

    return production


@router.get(
    "/",
    response_model=list[ProductionResponseSchema]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_production_orders(db)


@router.post(
    "/progress",
    response_model=ProductionProgressResponseSchema
)
def create_production_progress(
    data: ProductionProgressSchema,
    db: Session = Depends(get_db)
):

    progress = create_progress(
        db,
        data
    )

    if not progress:

        raise HTTPException(
            status_code=404,
            detail="Production order not found"
        )

    return progress


@router.get(
    "/progress",
    response_model=list[
        ProductionProgressResponseSchema
    ]
)
def read_progress(
    db: Session = Depends(get_db)
):

    return get_progress_list(db)