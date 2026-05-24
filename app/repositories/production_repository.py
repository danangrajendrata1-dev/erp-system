from sqlalchemy.orm import Session
from app.models.production_model import ProductionOrder
from app.schemas.production_schema import ProductionOrderCreate, ProductionOrderUpdate


class ProductionRepository:

    @staticmethod
    def create(db: Session, data: ProductionOrderCreate):
        new_order = ProductionOrder(**data.model_dump())
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(ProductionOrder)
            .order_by(ProductionOrder.id.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, order_id: int):
        return (
            db.query(ProductionOrder)
            .filter(ProductionOrder.id == order_id)
            .first()
        )

    @staticmethod
    def update(db: Session, order_id: int, data: ProductionOrderUpdate):
        order = (
            db.query(ProductionOrder)
            .filter(ProductionOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(order, key, value)

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def update_status(db: Session, order_id: int, status: str):
        order = (
            db.query(ProductionOrder)
            .filter(ProductionOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        order.status = status

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def delete(db: Session, order_id: int):
        order = (
            db.query(ProductionOrder)
            .filter(ProductionOrder.id == order_id)
            .first()
        )

        if not order:
            return None

        db.delete(order)
        db.commit()
        return order