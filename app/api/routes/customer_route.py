from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.customer_schema import (
    CustomerCreateSchema,
    CustomerResponseSchema
)

from app.services.customer_service import (
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    delete_customer
)

from app.core.dependencies import (
    get_current_user,
    admin_only
)

router = APIRouter(
    prefix="/customers",
    tags=["CUSTOMERS"]
)


# =========================
# CREATE CUSTOMER
# =========================
@router.post(
    "/",
    response_model=CustomerResponseSchema
)
def create(
    data: CustomerCreateSchema,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_customer(
        db,
        data
    )


# =========================
# GET ALL CUSTOMERS
# =========================
@router.get(
    "/",
    response_model=list[
        CustomerResponseSchema
    ]
)
def read_all(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return get_customers(db)


# =========================
# GET CUSTOMER BY ID
# =========================
@router.get(
    "/{customer_id}",
    response_model=CustomerResponseSchema
)
def read_one(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    customer = get_customer_by_id(
        db,
        customer_id
    )

    if not customer:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


# =========================
# UPDATE CUSTOMER
# =========================
@router.put(
    "/{customer_id}",
    response_model=CustomerResponseSchema
)
def update(
    customer_id: int,
    data: CustomerCreateSchema,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    customer = update_customer(
        db,
        customer_id,
        data
    )

    if not customer:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


# =========================
# DELETE CUSTOMER
# ADMIN ONLY
# =========================
@router.delete("/{customer_id}")
def remove(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(admin_only)
):

    customer = delete_customer(
        db,
        customer_id
    )

    if not customer:

        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return {
        "message": "Customer deleted successfully"
    }