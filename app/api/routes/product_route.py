from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.product_schema import (
    ProductCreateSchema,
    ProductResponseSchema
)

from app.services.product_service import (
    create_product,
    get_products,
    get_product_by_id,
    update_product,
    delete_product
)

router = APIRouter(
    prefix="/products",
    tags=["PRODUCTS"]
)


@router.post(
    "/",
    response_model=ProductResponseSchema
)
def create(
    data: ProductCreateSchema,
    db: Session = Depends(get_db)
):

    return create_product(db, data)


@router.get(
    "/",
    response_model=list[ProductResponseSchema]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponseSchema
)
def read_one(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = get_product_by_id(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponseSchema
)
def update(
    product_id: int,
    data: ProductCreateSchema,
    db: Session = Depends(get_db)
):

    product = update_product(
        db,
        product_id,
        data
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.delete("/{product_id}")
def delete(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = delete_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted"
    }