from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.bkpt_receivables_schema import (
    BKPtReceivableCreate,
    BKPtReceivableUpdate,
    BKPtReceivableResponse,
)
from app.services.bkpt_receivables_service import BKPtReceivableService


router = APIRouter(
    prefix="/bkpt-receivables",
    tags=["BKPt Receivables"],
)

service = BKPtReceivableService()


@router.get("/", response_model=List[BKPtReceivableResponse])
def get_bkpt_receivables(
    customer_name: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    no_invoice: Optional[str] = None,
    invoice_year: Optional[int] = None,
    invoice_month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return service.get_all(
        db=db,
        customer_name=customer_name,
        month=month,
        year=year,
        no_invoice=no_invoice,
        invoice_year=invoice_year,
        invoice_month=invoice_month,
    )


@router.post("/", response_model=BKPtReceivableResponse)
def create_bkpt_receivable(
    data: BKPtReceivableCreate,
    db: Session = Depends(get_db),
):
    return service.create(db, data)


@router.get("/{bkpt_id}", response_model=BKPtReceivableResponse)
def get_bkpt_receivable(
    bkpt_id: int,
    db: Session = Depends(get_db),
):
    return service.get_by_id(db, bkpt_id)


@router.put("/{bkpt_id}", response_model=BKPtReceivableResponse)
def update_bkpt_receivable(
    bkpt_id: int,
    data: BKPtReceivableUpdate,
    db: Session = Depends(get_db),
):
    return service.update(db, bkpt_id, data)


@router.delete("/{bkpt_id}")
def delete_bkpt_receivable(
    bkpt_id: int,
    db: Session = Depends(get_db),
):
    service.delete(db, bkpt_id)

    return {
        "status": "success",
        "message": "Data BKPt berhasil dihapus",
    }
