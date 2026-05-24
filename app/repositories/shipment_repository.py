from sqlalchemy.orm import Session

from app.models.shipment_model import Shipment
from app.schemas.shipment_schema import ShipmentCreate, ShipmentUpdate


class ShipmentRepository:

    @staticmethod
    def create(db: Session, data: ShipmentCreate):
        shipment = Shipment(**data.model_dump())
        db.add(shipment)
        db.commit()
        db.refresh(shipment)
        return shipment

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(Shipment)
            .order_by(Shipment.id.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, shipment_id: int):
        return (
            db.query(Shipment)
            .filter(Shipment.id == shipment_id)
            .first()
        )

    @staticmethod
    def get_by_production_order(db: Session, production_order_id: int):
        return (
            db.query(Shipment)
            .filter(Shipment.production_order_id == production_order_id)
            .order_by(Shipment.id.desc())
            .all()
        )

    @staticmethod
    def update(db: Session, shipment_id: int, data: ShipmentUpdate):
        shipment = (
            db.query(Shipment)
            .filter(Shipment.id == shipment_id)
            .first()
        )

        if not shipment:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(shipment, key, value)

        db.commit()
        db.refresh(shipment)
        return shipment

    @staticmethod
    def delete(db: Session, shipment_id: int):
        shipment = (
            db.query(Shipment)
            .filter(Shipment.id == shipment_id)
            .first()
        )

        if not shipment:
            return None

        db.delete(shipment)
        db.commit()
        return shipment