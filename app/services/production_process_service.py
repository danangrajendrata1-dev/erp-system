from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.bkorder_model import BKOrder
from app.repositories.production_process_repository import ProductionProcessRepository
from app.schemas.production_process_schema import (
    ProductionProcessCreate,
    ProductionProcessUpdate
)


class ProductionProcessService:

    allowed_process_types = [
        "POTONG",
        "CETAK",
        "FINISHING"
    ]

    @staticmethod
    def create_process(db: Session, data: ProductionProcessCreate):
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

        if data.process_type not in ProductionProcessService.allowed_process_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid process type"
            )

        process = ProductionProcessRepository.create(db, data)

        if data.process_type in ["POTONG", "CETAK"]:
            production_order.status = "POTONG_CETAK"

        if data.process_type == "FINISHING":
            production_order.status = "FINISHING"

        db.commit()
        db.refresh(production_order)

        return process

    @staticmethod
    def get_all_processes(db: Session):
        return ProductionProcessRepository.get_all(db)

    @staticmethod
    def get_process_detail(db: Session, process_id: int):
        process = ProductionProcessRepository.get_by_id(db, process_id)

        if not process:
            raise HTTPException(
                status_code=404,
                detail="Production process not found"
            )

        return process

    @staticmethod
    def get_processes_by_order(db: Session, production_order_id: int):
        return ProductionProcessRepository.get_by_production_order(
            db,
            production_order_id
        )

    @staticmethod
    def update_process(db: Session, process_id: int, data: ProductionProcessUpdate):
        if data.process_type and data.process_type not in ProductionProcessService.allowed_process_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid process type"
            )

        process = ProductionProcessRepository.update(db, process_id, data)

        if not process:
            raise HTTPException(
                status_code=404,
                detail="Production process not found"
            )

        return process

    @staticmethod
    def delete_process(db: Session, process_id: int):
        process = ProductionProcessRepository.delete(db, process_id)

        if not process:
            raise HTTPException(
                status_code=404,
                detail="Production process not found"
            )

        return {
            "message": "Production process deleted successfully"
        }
