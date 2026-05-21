from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.sales_order_schema import (
    SalesOrderCreateSchema,
    SalesOrderResponseSchema
)

from app.services.sales_order_service import (
    create_sales_order,
    get_sales_orders
)

router = APIRouter(
    prefix="/sales-orders",
    tags=["SALES ORDERS"]
)


@router.post(
    "/",
    response_model=SalesOrderResponseSchema
)
def create(
    data: SalesOrderCreateSchema,
    db: Session = Depends(get_db)
):

    order = create_sales_order(
        db,
        data
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return order


@router.get(
    "/",
    response_model=list[SalesOrderResponseSchema]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_sales_orders(db)