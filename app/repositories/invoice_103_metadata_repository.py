from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.invoice_103_metadata_model import Invoice103Metadata
from app.schemas.invoice_103_metadata_schema import Invoice103MetadataUpdate


class Invoice103MetadataRepository:
    def get_by_invoice_period(
        self,
        db: Session,
        no_invoice: str,
        invoice_year: int,
        invoice_month: int,
    ):
        return (
            db.query(Invoice103Metadata)
            .filter(func.lower(Invoice103Metadata.no_invoice) == no_invoice.lower())
            .filter(Invoice103Metadata.invoice_year == invoice_year)
            .filter(Invoice103Metadata.invoice_month == invoice_month)
            .first()
        )

    def get_by_no_invoice(self, db: Session, no_invoice: str):
        return (
            db.query(Invoice103Metadata)
            .filter(func.lower(Invoice103Metadata.no_invoice) == no_invoice.lower())
            .first()
        )

    def upsert(
        self,
        db: Session,
        no_invoice: str,
        invoice_year: int | None,
        invoice_month: int | None,
        data: Invoice103MetadataUpdate,
    ):
        if invoice_year is not None and invoice_month is not None:
            item = self.get_by_invoice_period(
                db,
                no_invoice,
                invoice_year,
                invoice_month,
            )
        else:
            item = self.get_by_no_invoice(db, no_invoice)
        update_data = data.model_dump(exclude_unset=True)

        if item:
            for key, value in update_data.items():
                setattr(item, key, value)
        else:
            # Metadata ini khusus kebutuhan cetak Invoice 103, bukan pengganti data Sales 103.
            item = Invoice103Metadata(
                no_invoice=no_invoice,
                invoice_year=invoice_year,
                invoice_month=invoice_month,
                **update_data,
            )
            db.add(item)

        db.commit()
        db.refresh(item)
        return item
