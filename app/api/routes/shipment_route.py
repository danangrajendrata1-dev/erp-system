from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.shipment_schema import (
    ShipmentCreate,
    ShipmentUpdate,
    ShipmentResponse
)
from app.services.shipment_service import ShipmentService


router = APIRouter(
    prefix="/shipments",
    tags=["Shipments"]
)


@router.post("/", response_model=ShipmentResponse)
def create_shipment(
    data: ShipmentCreate,
    db: Session = Depends(get_db)
):
    return ShipmentService.create_shipment(db, data)


@router.get("/", response_model=list[ShipmentResponse])
def get_all_shipments(
    db: Session = Depends(get_db)
):
    return ShipmentService.get_all_shipments(db)


@router.get("/order/{production_order_id}", response_model=list[ShipmentResponse])
def get_shipments_by_order(
    production_order_id: int,
    db: Session = Depends(get_db)
):
    return ShipmentService.get_shipments_by_order(db, production_order_id)


@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment_detail(
    shipment_id: int,
    db: Session = Depends(get_db)
):
    return ShipmentService.get_shipment_detail(db, shipment_id)


@router.put("/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(
    shipment_id: int,
    data: ShipmentUpdate,
    db: Session = Depends(get_db)
):
    return ShipmentService.update_shipment(db, shipment_id, data)


@router.delete("/{shipment_id}")
def delete_shipment(
    shipment_id: int,
    db: Session = Depends(get_db)
):
    return ShipmentService.delete_shipment(db, shipment_id)