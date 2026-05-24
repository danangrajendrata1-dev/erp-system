from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.production_process_schema import (
    ProductionProcessCreate,
    ProductionProcessUpdate,
    ProductionProcessResponse
)
from app.services.production_process_service import ProductionProcessService


router = APIRouter(
    prefix="/production-processes",
    tags=["Production Processes"]
)


@router.post("/", response_model=ProductionProcessResponse)
def create_process(
    data: ProductionProcessCreate,
    db: Session = Depends(get_db)
):
    return ProductionProcessService.create_process(db, data)


@router.get("/", response_model=list[ProductionProcessResponse])
def get_all_processes(
    db: Session = Depends(get_db)
):
    return ProductionProcessService.get_all_processes(db)


@router.get("/order/{production_order_id}", response_model=list[ProductionProcessResponse])
def get_processes_by_order(
    production_order_id: int,
    db: Session = Depends(get_db)
):
    return ProductionProcessService.get_processes_by_order(db, production_order_id)


@router.get("/{process_id}", response_model=ProductionProcessResponse)
def get_process_detail(
    process_id: int,
    db: Session = Depends(get_db)
):
    return ProductionProcessService.get_process_detail(db, process_id)


@router.put("/{process_id}", response_model=ProductionProcessResponse)
def update_process(
    process_id: int,
    data: ProductionProcessUpdate,
    db: Session = Depends(get_db)
):
    return ProductionProcessService.update_process(db, process_id, data)


@router.delete("/{process_id}")
def delete_process(
    process_id: int,
    db: Session = Depends(get_db)
):
    return ProductionProcessService.delete_process(db, process_id)