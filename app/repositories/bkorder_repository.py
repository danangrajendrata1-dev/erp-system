from typing import Optional

from sqlalchemy import extract, or_
from sqlalchemy.orm import Session

from app.models.bkorder_model import BKOrder
from app.schemas.bkorder_schema import BKOrderCreate, BKOrderUpdate


class BKOrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
    ):
        query = self.db.query(BKOrder)

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    BKOrder.order_number.ilike(like),
                    BKOrder.do_number.ilike(like),
                    BKOrder.customer_name.ilike(like),
                    BKOrder.material_type.ilike(like),
                    BKOrder.print_type.ilike(like),
                    BKOrder.specification.ilike(like),
                )
            )

        if status:
            query = query.filter(BKOrder.status == status)

        if month:
            query = query.filter(extract("month", BKOrder.order_date) == month)

        if year:
            query = query.filter(extract("year", BKOrder.order_date) == year)

        return query.order_by(
            BKOrder.order_date.asc().nullslast(),
            BKOrder.id.asc(),
        ).all()

    def get_by_id(self, bkorder_id: int):
        return (
            self.db.query(BKOrder)
            .filter(BKOrder.id == bkorder_id)
            .first()
        )

    def create(self, data: BKOrderCreate):
        obj = BKOrder(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, bkorder_id: int, data: BKOrderUpdate):
        obj = self.get_by_id(bkorder_id)
        if not obj:
            return None

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)

        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, bkorder_id: int):
        obj = self.get_by_id(bkorder_id)
        if not obj:
            return None

        self.db.delete(obj)
        self.db.commit()
        return obj
