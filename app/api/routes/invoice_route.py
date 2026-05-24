from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.invoice_schema import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse
)
from app.services.invoice_service import InvoiceService


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db)
):
    return InvoiceService.create_invoice(db, data)


@router.get("/", response_model=list[InvoiceResponse])
def get_all_invoices(
    db: Session = Depends(get_db)
):
    return InvoiceService.get_all_invoices(db)


@router.get("/order/{production_order_id}", response_model=list[InvoiceResponse])
def get_invoices_by_order(
    production_order_id: int,
    db: Session = Depends(get_db)
):
    return InvoiceService.get_invoices_by_order(db, production_order_id)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice_detail(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    return InvoiceService.get_invoice_detail(db, invoice_id)


@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    db: Session = Depends(get_db)
):
    return InvoiceService.update_invoice(db, invoice_id, data)


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    return InvoiceService.delete_invoice(db, invoice_id)