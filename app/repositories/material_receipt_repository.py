from sqlalchemy.orm import Session

from app.models.material_receipt_model import MaterialReceipt
from app.schemas.material_receipt_schema import (
    MaterialReceiptCreate,
    MaterialReceiptUpdate
)


class MaterialReceiptRepository:

    @staticmethod
    def create(db: Session, data: MaterialReceiptCreate):
        new_receipt = MaterialReceipt(**data.model_dump())
        db.add(new_receipt)
        db.commit()
        db.refresh(new_receipt)
        return new_receipt

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(MaterialReceipt)
            .order_by(MaterialReceipt.id.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, receipt_id: int):
        return (
            db.query(MaterialReceipt)
            .filter(MaterialReceipt.id == receipt_id)
            .first()
        )

    @staticmethod
    def get_by_production_order(db: Session, production_order_id: int):
        return (
            db.query(MaterialReceipt)
            .filter(MaterialReceipt.production_order_id == production_order_id)
            .order_by(MaterialReceipt.id.desc())
            .all()
        )

    @staticmethod
    def update(db: Session, receipt_id: int, data: MaterialReceiptUpdate):
        receipt = (
            db.query(MaterialReceipt)
            .filter(MaterialReceipt.id == receipt_id)
            .first()
        )

        if not receipt:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(receipt, key, value)

        db.commit()
        db.refresh(receipt)
        return receipt

    @staticmethod
    def delete(db: Session, receipt_id: int):
        receipt = (
            db.query(MaterialReceipt)
            .filter(MaterialReceipt.id == receipt_id)
            .first()
        )

        if not receipt:
            return None

        db.delete(receipt)
        db.commit()
        return receipt