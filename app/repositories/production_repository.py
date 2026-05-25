from typing import Optional

from sqlalchemy import extract, or_
from sqlalchemy.orm import Session

from app.models.production_model import ProductionOrder
from app.schemas.production_schema import ProductionOrderCreate, ProductionOrderUpdate


class ProductionOrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
    ):
        query = self.db.query(ProductionOrder)

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    ProductionOrder.order_number.ilike(like),
                    ProductionOrder.do_number.ilike(like),
                    ProductionOrder.customer_name.ilike(like),
                    ProductionOrder.material_type.ilike(like),
                    ProductionOrder.print_type.ilike(like),
                    ProductionOrder.specification.ilike(like),
                )
            )

        if status:
            query = query.filter(ProductionOrder.status == status)

        if month:
            query = query.filter(extract("month", ProductionOrder.order_date) == month)

        if year:
            query = query.filter(extract("year", ProductionOrder.order_date) == year)

        return query.order_by(
            ProductionOrder.order_date.asc().nullslast(),
            ProductionOrder.id.asc(),
        ).all()

    def get_by_id(self, production_order_id: int):
        return (
            self.db.query(ProductionOrder)
            .filter(ProductionOrder.id == production_order_id)
            .first()
        )

    def create(self, data: ProductionOrderCreate):
        obj = ProductionOrder(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, production_order_id: int, data: ProductionOrderUpdate):
        obj = self.get_by_id(production_order_id)
        if not obj:
            return None

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)

        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, production_order_id: int):
        obj = self.get_by_id(production_order_id)
        if not obj:
            return None

        self.db.delete(obj)
        self.db.commit()
        return obj
