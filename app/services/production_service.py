from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.production_schema import ProductionOrderCreate, ProductionOrderUpdate
from app.repositories.production_repository import ProductionRepository
from app.models.material_receipt_model import MaterialReceipt
from app.models.production_process_model import ProductionProcess
from app.models.shipment_model import Shipment
from app.models.invoice_model import Invoice


class ProductionService:

    allowed_status = [
        "PO_MASUK",
        "BAHAN_DATANG",
        "POTONG_CETAK",
        "FINISHING",
        "DIKIRIM",
        "INVOICE_TERBIT",
        "SELESAI",
        "CANCELLED"
    ]

    @staticmethod
    def create_order(db: Session, data: ProductionOrderCreate):
        return ProductionRepository.create(db, data)

    @staticmethod
    def get_all_orders(db: Session):
        return ProductionRepository.get_all(db)

    @staticmethod
    def get_order_detail(db: Session, order_id: int):
        order = ProductionRepository.get_by_id(db, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        return order

    @staticmethod
    def get_order_timeline(db: Session, order_id: int):
        order = ProductionRepository.get_by_id(db, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        material_receipts = (
            db.query(MaterialReceipt)
            .filter(MaterialReceipt.production_order_id == order_id)
            .order_by(MaterialReceipt.id.desc())
            .all()
        )

        processes = (
            db.query(ProductionProcess)
            .filter(ProductionProcess.production_order_id == order_id)
            .order_by(ProductionProcess.id.asc())
            .all()
        )

        shipments = (
            db.query(Shipment)
            .filter(Shipment.production_order_id == order_id)
            .order_by(Shipment.id.desc())
            .all()
        )

        invoices = (
            db.query(Invoice)
            .filter(Invoice.production_order_id == order_id)
            .order_by(Invoice.id.desc())
            .all()
        )

        return {
            "order": order,
            "material_receipts": material_receipts,
            "processes": processes,
            "shipments": shipments,
            "invoices": invoices
        }

    @staticmethod
    def update_order(db: Session, order_id: int, data: ProductionOrderUpdate):
        order = ProductionRepository.update(db, order_id, data)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        return order

    @staticmethod
    def update_order_status(db: Session, order_id: int, status: str):
        if status not in ProductionService.allowed_status:
            raise HTTPException(
                status_code=400,
                detail="Invalid production order status"
            )

        order = ProductionRepository.update_status(db, order_id, status)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        return order

    @staticmethod
    def delete_order(db: Session, order_id: int):
        order = ProductionRepository.delete(db, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        return {
            "message": "Production order deleted successfully"
        }