from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.material_schema import (
    MaterialCreateSchema,
    MaterialResponseSchema
)

from app.services.material_service import (
    create_material,
    get_materials,
    get_material_by_id
)

router = APIRouter(
    prefix="/materials",
    tags=["MATERIALS"]
)


@router.post(
    "/",
    response_model=MaterialResponseSchema
)
def create(
    data: MaterialCreateSchema,
    db: Session = Depends(get_db)
):

    return create_material(db, data)


@router.get(
    "/",
    response_model=list[MaterialResponseSchema]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_materials(db)


@router.get(
    "/{material_id}",
    response_model=MaterialResponseSchema
)
def read_one(
    material_id: int,
    db: Session = Depends(get_db)
):

    material = get_material_by_id(
        db,
        material_id
    )

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    return material