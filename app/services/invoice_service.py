from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.production_model import ProductionOrder
from app.repositories.invoice_repository import InvoiceRepository
from app.schemas.invoice_schema import InvoiceCreate, InvoiceUpdate


class InvoiceService:

    allowed_payment_status = [
        "UNPAID",
        "PARTIAL",
        "PAID",
        "CANCELLED"
    ]

    @staticmethod
    def calculate_invoice(subtotal, ppn_percent):
        subtotal = Decimal(subtotal or 0)
        ppn_percent = Decimal(ppn_percent or 0)

        ppn_amount = subtotal * ppn_percent / Decimal(100)
        grand_total = subtotal + ppn_amount

        return ppn_amount, grand_total

    @staticmethod
    def create_invoice(db: Session, data: InvoiceCreate):
        production_order = (
            db.query(ProductionOrder)
            .filter(ProductionOrder.id == data.production_order_id)
            .first()
        )

        if not production_order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        if data.payment_status not in InvoiceService.allowed_payment_status:
            raise HTTPException(
                status_code=400,
                detail="Invalid payment status"
            )

        payload = data.model_dump()

        if not payload.get("customer_id"):
            payload["customer_id"] = production_order.customer_id

        if not payload.get("customer_name"):
            payload["customer_name"] = production_order.customer_name

        if not payload.get("subtotal") or payload.get("subtotal") == 0:
            price = Decimal(production_order.price or 0)
            qty = Decimal(production_order.total_quantity or production_order.rim or production_order.quantity or 0)
            payload["subtotal"] = price * qty

        ppn_amount, grand_total = InvoiceService.calculate_invoice(
            payload.get("subtotal"),
            payload.get("ppn_percent")
        )

        payload["ppn_amount"] = ppn_amount
        payload["grand_total"] = grand_total

        invoice = InvoiceRepository.create(
            db,
            InvoiceCreate(**payload)
        )

        production_order.status = "INVOICE_TERBIT"
        db.commit()
        db.refresh(production_order)

        return invoice

    @staticmethod
    def get_all_invoices(db: Session):
        return InvoiceRepository.get_all(db)

    @staticmethod
    def get_invoice_detail(db: Session, invoice_id: int):
        invoice = InvoiceRepository.get_by_id(db, invoice_id)

        if not invoice:
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )

        return invoice

    @staticmethod
    def get_invoices_by_order(db: Session, production_order_id: int):
        return InvoiceRepository.get_by_production_order(
            db,
            production_order_id
        )

    @staticmethod
    def update_invoice(db: Session, invoice_id: int, data: InvoiceUpdate):
        if data.payment_status and data.payment_status not in InvoiceService.allowed_payment_status:
            raise HTTPException(
                status_code=400,
                detail="Invalid payment status"
            )

        update_data = data.model_dump(exclude_unset=True)

        if "subtotal" in update_data or "ppn_percent" in update_data:
            old_invoice = InvoiceRepository.get_by_id(db, invoice_id)

            if not old_invoice:
                raise HTTPException(
                    status_code=404,
                    detail="Invoice not found"
                )

            subtotal = update_data.get("subtotal", old_invoice.subtotal)
            ppn_percent = update_data.get("ppn_percent", old_invoice.ppn_percent)

            ppn_amount, grand_total = InvoiceService.calculate_invoice(
                subtotal,
                ppn_percent
            )

            update_data["ppn_amount"] = ppn_amount
            update_data["grand_total"] = grand_total

            data = InvoiceUpdate(**update_data)

        invoice = InvoiceRepository.update(db, invoice_id, data)

        if not invoice:
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )

        return invoice

    @staticmethod
    def delete_invoice(db: Session, invoice_id: int):
        invoice = InvoiceRepository.delete(db, invoice_id)

        if not invoice:
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )

        return {
            "message": "Invoice deleted successfully"
        }