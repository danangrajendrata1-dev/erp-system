from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.invoice_103_metadata_repository import (
    Invoice103MetadataRepository,
)
from app.schemas.invoice_103_metadata_schema import Invoice103MetadataUpdate


class Invoice103MetadataService:

    def __init__(self):
        self.repository = Invoice103MetadataRepository()

    def get_by_invoice(
        self,
        db: Session,
        no_invoice: str,
        invoice_year: int | None = None,
        invoice_month: int | None = None,
    ):
        if invoice_year is not None and invoice_month is not None:
            item = self.repository.get_by_invoice_period(
                db,
                no_invoice,
                invoice_year,
                invoice_month,
            )
        else:
            item = self.repository.get_by_no_invoice(db, no_invoice)

        if not item:
            raise HTTPException(
                status_code=404,
                detail="Metadata Invoice 103 belum dibuat",
            )

        return item

    def upsert(
        self,
        db: Session,
        no_invoice: str,
        invoice_year: int | None,
        invoice_month: int | None,
        data: Invoice103MetadataUpdate,
    ):
        return self.repository.upsert(
            db,
            no_invoice,
            invoice_year,
            invoice_month,
            data,
        )
