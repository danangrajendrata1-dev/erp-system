from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.production_model import ProductionOrder
from app.repositories.shipment_repository import ShipmentRepository
from app.schemas.shipment_schema import ShipmentCreate, ShipmentUpdate


class ShipmentService:

    @staticmethod
    def create_shipment(db: Session, data: ShipmentCreate):
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

        payload = data.model_dump()

        if not payload.get("customer_name"):
            payload["customer_name"] = production_order.customer_name

        if not payload.get("unit"):
            payload["unit"] = production_order.unit

        shipment = ShipmentRepository.create(
            db,
            ShipmentCreate(**payload)
        )

        production_order.status = "DIKIRIM"
        db.commit()
        db.refresh(production_order)

        return shipment

    @staticmethod
    def get_all_shipments(db: Session):
        return ShipmentRepository.get_all(db)

    @staticmethod
    def get_shipment_detail(db: Session, shipment_id: int):
        shipment = ShipmentRepository.get_by_id(db, shipment_id)

        if not shipment:
            raise HTTPException(
                status_code=404,
                detail="Shipment not found"
            )

        return shipment

    @staticmethod
    def get_shipments_by_order(db: Session, production_order_id: int):
        return ShipmentRepository.get_by_production_order(
            db,
            production_order_id
        )

    @staticmethod
    def update_shipment(db: Session, shipment_id: int, data: ShipmentUpdate):
        shipment = ShipmentRepository.update(db, shipment_id, data)

        if not shipment:
            raise HTTPException(
                status_code=404,
                detail="Shipment not found"
            )

        return shipment

    @staticmethod
    def delete_shipment(db: Session, shipment_id: int):
        shipment = ShipmentRepository.delete(db, shipment_id)

        if not shipment:
            raise HTTPException(
                status_code=404,
                detail="Shipment not found"
            )

        return {
            "message": "Shipment deleted successfully"
        }