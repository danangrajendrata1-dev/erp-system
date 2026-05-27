from urllib.parse import unquote

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.invoice_103_metadata_schema import (
    Invoice103MetadataResponse,
    Invoice103MetadataUpdate,
)
from app.services.invoice_103_metadata_service import Invoice103MetadataService


router = APIRouter(
    prefix="/invoice-103-metadata",
    tags=["Invoice 103 Metadata"],
)

service = Invoice103MetadataService()


@router.get("/{no_invoice:path}", response_model=Invoice103MetadataResponse)
def get_invoice_103_metadata(
    no_invoice: str,
    db: Session = Depends(get_db),
):
    decoded_invoice = unquote(no_invoice).strip()

    return service.get_by_no_invoice(db, decoded_invoice)


@router.put("/{no_invoice:path}", response_model=Invoice103MetadataResponse)
def save_invoice_103_metadata(
    no_invoice: str,
    payload: Invoice103MetadataUpdate,
    db: Session = Depends(get_db),
):
    decoded_invoice = unquote(no_invoice).strip()

    return service.upsert(db, decoded_invoice, payload)
