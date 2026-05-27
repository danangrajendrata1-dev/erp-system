from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.bank_103_schema import (
    AllocateBank103ToMultipleBKPtRequest,
    ApplyBank103ToBKPtRequest,
    Bank103Create,
    Bank103Response,
    Bank103Update,
)
from app.services.bank_103_service import Bank103Service


router = APIRouter(
    prefix="/bank-103",
    tags=["Bank 103"],
)


@router.get("/", response_model=list[Bank103Response])
def get_bank_103(
    kode: Optional[str] = Query(default=None),
    no_invoice: Optional[str] = Query(default=None),
    is_used: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
):
    return Bank103Service(db).get_all(
        kode=kode,
        no_invoice=no_invoice,
        is_used=is_used,
    )


@router.get("/available-bkpt-payments", response_model=list[Bank103Response])
def get_available_bkpt_payments(db: Session = Depends(get_db)):
    return Bank103Service(db).get_available_bkpt_payments()


@router.post("/", response_model=Bank103Response)
def create_bank_103(
    data: Bank103Create,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).create(data)


@router.get("/{bank_id}", response_model=Bank103Response)
def get_bank_103_by_id(
    bank_id: int,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).get_by_id(bank_id)


@router.put("/{bank_id}", response_model=Bank103Response)
def update_bank_103(
    bank_id: int,
    data: Bank103Update,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).update(bank_id, data)


@router.delete("/{bank_id}", response_model=Bank103Response)
def delete_bank_103(
    bank_id: int,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).delete(bank_id)


@router.post("/{bank_id}/apply-to-bkpt")
def apply_bank_103_to_bkpt(
    bank_id: int,
    data: ApplyBank103ToBKPtRequest,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).apply_to_bkpt(
        bank_id=bank_id,
        bkpt_receivable_id=data.bkpt_receivable_id,
    )


@router.post("/{bank_id}/allocate-bkpt")
def allocate_bank_103_to_multiple_bkpt(
    bank_id: int,
    data: AllocateBank103ToMultipleBKPtRequest,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).allocate_to_multiple_bkpt(
        bank_id=bank_id,
        allocations=data.allocations,
    )


@router.post("/{bank_id}/auto-apply-to-bkpt")
def auto_apply_bank_103_to_bkpt(
    bank_id: int,
    db: Session = Depends(get_db),
):
    return Bank103Service(db).auto_apply_to_bkpt(bank_id)