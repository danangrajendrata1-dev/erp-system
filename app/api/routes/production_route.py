from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.production_schema import (
    ProductionOrderCreate,
    ProductionOrderUpdate,
    ProductionOrderResponse
)
from app.services.production_service import ProductionService


router = APIRouter(
    prefix="/purchase-orders",
    tags=["Production Orders"]
)


@router.post("/", response_model=ProductionOrderResponse)
def create_order(
    data: ProductionOrderCreate,
    db: Session = Depends(get_db)
):
    return ProductionService.create_order(db, data)


@router.get("/", response_model=list[ProductionOrderResponse])
def get_all_orders(
    db: Session = Depends(get_db)
):
    return ProductionService.get_all_orders(db)

@router.get("/{order_id}/timeline")
def get_order_timeline(
    order_id: int,
    db: Session = Depends(get_db)
):
    return ProductionService.get_order_timeline(db, order_id)

@router.get("/{order_id}", response_model=ProductionOrderResponse)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db)
):
    return ProductionService.get_order_detail(db, order_id)


@router.put("/{order_id}", response_model=ProductionOrderResponse)
def update_order(
    order_id: int,
    data: ProductionOrderUpdate,
    db: Session = Depends(get_db)
):
    return ProductionService.update_order(db, order_id, data)


@router.patch("/{order_id}/status", response_model=ProductionOrderResponse)
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    return ProductionService.update_order_status(db, order_id, status)


@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    return ProductionService.delete_order(db, order_id)