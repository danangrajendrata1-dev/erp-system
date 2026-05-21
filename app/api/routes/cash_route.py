from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.cash_schema import (
    CashCreateSchema,
    CashResponseSchema
)

from app.services.cash_service import (
    create_cash_transaction,
    get_cash_transactions,
    get_cash_balance
)

router = APIRouter(
    prefix="/cash",
    tags=["CASH"]
)


@router.post(
    "/",
    response_model=CashResponseSchema
)
def create(
    data: CashCreateSchema,
    db: Session = Depends(get_db)
):

    return create_cash_transaction(
        db,
        data
    )


@router.get(
    "/",
    response_model=list[
        CashResponseSchema
    ]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_cash_transactions(db)


@router.get("/balance")
def get_balance(
    db: Session = Depends(get_db)
):

    return get_cash_balance(db)