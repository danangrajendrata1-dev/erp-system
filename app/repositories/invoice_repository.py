from sqlalchemy.orm import Session

from app.models.invoice_model import Invoice
from app.schemas.invoice_schema import InvoiceCreate, InvoiceUpdate


class InvoiceRepository:

    @staticmethod
    def create(db: Session, data: InvoiceCreate):
        invoice = Invoice(**data.model_dump())
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        return invoice

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(Invoice)
            .order_by(Invoice.id.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, invoice_id: int):
        return (
            db.query(Invoice)
            .filter(Invoice.id == invoice_id)
            .first()
        )

    @staticmethod
    def get_by_production_order(db: Session, production_order_id: int):
        return (
            db.query(Invoice)
            .filter(Invoice.production_order_id == production_order_id)
            .order_by(Invoice.id.desc())
            .all()
        )

    @staticmethod
    def update(db: Session, invoice_id: int, data: InvoiceUpdate):
        invoice = (
            db.query(Invoice)
            .filter(Invoice.id == invoice_id)
            .first()
        )

        if not invoice:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(invoice, key, value)

        db.commit()
        db.refresh(invoice)
        return invoice

    @staticmethod
    def delete(db: Session, invoice_id: int):
        invoice = (
            db.query(Invoice)
            .filter(Invoice.id == invoice_id)
            .first()
        )

        if not invoice:
            return None

        db.delete(invoice)
        db.commit()
        return invoice