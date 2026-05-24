from sqlalchemy.orm import Session

from app.models.production_process_model import ProductionProcess
from app.schemas.production_process_schema import (
    ProductionProcessCreate,
    ProductionProcessUpdate
)


class ProductionProcessRepository:

    @staticmethod
    def create(db: Session, data: ProductionProcessCreate):
        process = ProductionProcess(**data.model_dump())
        db.add(process)
        db.commit()
        db.refresh(process)
        return process

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(ProductionProcess)
            .order_by(ProductionProcess.id.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, process_id: int):
        return (
            db.query(ProductionProcess)
            .filter(ProductionProcess.id == process_id)
            .first()
        )

    @staticmethod
    def get_by_production_order(db: Session, production_order_id: int):
        return (
            db.query(ProductionProcess)
            .filter(ProductionProcess.production_order_id == production_order_id)
            .order_by(ProductionProcess.id.desc())
            .all()
        )

    @staticmethod
    def update(db: Session, process_id: int, data: ProductionProcessUpdate):
        process = (
            db.query(ProductionProcess)
            .filter(ProductionProcess.id == process_id)
            .first()
        )

        if not process:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(process, key, value)

        db.commit()
        db.refresh(process)
        return process

    @staticmethod
    def delete(db: Session, process_id: int):
        process = (
            db.query(ProductionProcess)
            .filter(ProductionProcess.id == process_id)
            .first()
        )

        if not process:
            return None

        db.delete(process)
        db.commit()
        return process