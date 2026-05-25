from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.production_schema import (
    ProductionOrderCreate,
    ProductionOrderResponse,
    ProductionOrderUpdate,
)
from app.services.production_service import ProductionOrderService

router = APIRouter(prefix="/production-orders", tags=["BKOrder"])


@router.get("/", response_model=List[ProductionOrderResponse])
def get_production_orders(
    search: Optional[str] = None,
    status: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return ProductionOrderService(db).get_all(
        search=search,
        status=status,
        month=month,
        year=year,
    )


@router.post("/", response_model=ProductionOrderResponse)
def create_production_order(
    data: ProductionOrderCreate,
    db: Session = Depends(get_db),
):
    return ProductionOrderService(db).create(data)


@router.get("/{production_order_id}", response_model=ProductionOrderResponse)
def get_production_order(
    production_order_id: int,
    db: Session = Depends(get_db),
):
    return ProductionOrderService(db).get_by_id(production_order_id)


@router.put("/{production_order_id}", response_model=ProductionOrderResponse)
def update_production_order(
    production_order_id: int,
    data: ProductionOrderUpdate,
    db: Session = Depends(get_db),
):
    return ProductionOrderService(db).update(production_order_id, data)


@router.delete("/{production_order_id}")
def delete_production_order(
    production_order_id: int,
    db: Session = Depends(get_db),
):
    return ProductionOrderService(db).delete(production_order_id)


@router.get("/{production_order_id}/timeline")
def get_production_order_timeline(
    production_order_id: int,
    db: Session = Depends(get_db),
):
    return ProductionOrderService(db).timeline(production_order_id)
