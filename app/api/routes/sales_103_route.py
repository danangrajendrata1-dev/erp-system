from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.sales_103_schema import (
    Sales103Create,
    Sales103Update,
    Sales103Response,
)
from app.services.sales_103_service import Sales103Service


router = APIRouter(
    prefix="/sales-103",
    tags=["Sales 103"],
)

service = Sales103Service()


@router.get("/", response_model=List[Sales103Response])
def get_all_sales_103(db: Session = Depends(get_db)):
    return service.get_all(db)


@router.get("/{sales_103_id}", response_model=Sales103Response)
def get_sales_103_by_id(
    sales_103_id: int,
    db: Session = Depends(get_db),
):
    data = service.get_by_id(db, sales_103_id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data sales 103 tidak ditemukan",
        )

    return data


@router.post("/", response_model=Sales103Response)
def create_sales_103(
    payload: Sales103Create,
    db: Session = Depends(get_db),
):
    return service.create(db, payload)


@router.put("/{sales_103_id}", response_model=Sales103Response)
def update_sales_103(
    sales_103_id: int,
    payload: Sales103Update,
    db: Session = Depends(get_db),
):
    data = service.update(db, sales_103_id, payload)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data sales 103 tidak ditemukan",
        )

    return data


@router.delete("/{sales_103_id}")
def delete_sales_103(
    sales_103_id: int,
    db: Session = Depends(get_db),
):
    data = service.delete(db, sales_103_id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data sales 103 tidak ditemukan",
        )

    return {
        "message": "Data sales 103 berhasil dihapus"
    }