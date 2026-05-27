from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.bkorder_model import BKOrder
from app.repositories.material_receipt_repository import MaterialReceiptRepository
from app.schemas.material_receipt_schema import (
    MaterialReceiptCreate,
    MaterialReceiptUpdate
)


class MaterialReceiptService:

    @staticmethod
    def create_receipt(db: Session, data: MaterialReceiptCreate):
        production_order = (
            db.query(BKOrder)
            .filter(BKOrder.id == data.production_order_id)
            .first()
        )

        if not production_order:
            raise HTTPException(
                status_code=404,
                detail="Production order not found"
            )

        receipt = MaterialReceiptRepository.create(db, data)

        production_order.status = "BAHAN_DATANG"
        db.commit()
        db.refresh(production_order)

        return receipt

    @staticmethod
    def get_all_receipts(db: Session):
        return MaterialReceiptRepository.get_all(db)

    @staticmethod
    def get_receipt_detail(db: Session, receipt_id: int):
        receipt = MaterialReceiptRepository.get_by_id(db, receipt_id)

        if not receipt:
            raise HTTPException(
                status_code=404,
                detail="Material receipt not found"
            )

        return receipt

    @staticmethod
    def get_receipts_by_order(db: Session, production_order_id: int):
        return MaterialReceiptRepository.get_by_production_order(
            db,
            production_order_id
        )

    @staticmethod
    def update_receipt(db: Session, receipt_id: int, data: MaterialReceiptUpdate):
        receipt = MaterialReceiptRepository.update(db, receipt_id, data)

        if not receipt:
            raise HTTPException(
                status_code=404,
                detail="Material receipt not found"
            )

        return receipt

    @staticmethod
    def delete_receipt(db: Session, receipt_id: int):
        receipt = MaterialReceiptRepository.delete(db, receipt_id)

        if not receipt:
            raise HTTPException(
                status_code=404,
                detail="Material receipt not found"
            )

        return {
            "message": "Material receipt deleted successfully"
        }
