from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.supplier_schema import (
    SupplierCreateSchema,
    SupplierResponseSchema
)

from app.services.supplier_service import (
    create_supplier,
    get_suppliers,
    get_supplier_by_id
)

router = APIRouter(
    prefix="/suppliers",
    tags=["SUPPLIERS"]
)


@router.post(
    "/",
    response_model=SupplierResponseSchema
)
def create(
    data: SupplierCreateSchema,
    db: Session = Depends(get_db)
):

    return create_supplier(db, data)


@router.get(
    "/",
    response_model=list[SupplierResponseSchema]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_suppliers(db)


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponseSchema
)
def read_one(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = get_supplier_by_id(
        db,
        supplier_id
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier