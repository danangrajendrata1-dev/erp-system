from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.invoice_103_metadata_repository import (
    Invoice103MetadataRepository,
)
from app.schemas.invoice_103_metadata_schema import Invoice103MetadataUpdate


class Invoice103MetadataService:

    def __init__(self):
        self.repository = Invoice103MetadataRepository()

    def get_by_no_invoice(self, db: Session, no_invoice: str):
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
        data: Invoice103MetadataUpdate,
    ):
        return self.repository.upsert(db, no_invoice, data)
