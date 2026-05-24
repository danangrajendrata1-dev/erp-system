from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.material_receipt_schema import (
    MaterialReceiptCreate,
    MaterialReceiptUpdate,
    MaterialReceiptResponse
)
from app.services.material_receipt_service import MaterialReceiptService


router = APIRouter(
    prefix="/material-receipts",
    tags=["Material Receipts"]
)


@router.post("/", response_model=MaterialReceiptResponse)
def create_receipt(
    data: MaterialReceiptCreate,
    db: Session = Depends(get_db)
):
    return MaterialReceiptService.create_receipt(db, data)


@router.get("/", response_model=list[MaterialReceiptResponse])
def get_all_receipts(
    db: Session = Depends(get_db)
):
    return MaterialReceiptService.get_all_receipts(db)


@router.get("/{receipt_id}", response_model=MaterialReceiptResponse)
def get_receipt_detail(
    receipt_id: int,
    db: Session = Depends(get_db)
):
    return MaterialReceiptService.get_receipt_detail(db, receipt_id)


@router.get("/order/{production_order_id}", response_model=list[MaterialReceiptResponse])
def get_receipts_by_order(
    production_order_id: int,
    db: Session = Depends(get_db)
):
    return MaterialReceiptService.get_receipts_by_order(db, production_order_id)


@router.put("/{receipt_id}", response_model=MaterialReceiptResponse)
def update_receipt(
    receipt_id: int,
    data: MaterialReceiptUpdate,
    db: Session = Depends(get_db)
):
    return MaterialReceiptService.update_receipt(db, receipt_id, data)


@router.delete("/{receipt_id}")
def delete_receipt(
    receipt_id: int,
    db: Session = Depends(get_db)
):
    return MaterialReceiptService.delete_receipt(db, receipt_id)