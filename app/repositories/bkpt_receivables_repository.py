from sqlalchemy.orm import Session
from sqlalchemy import extract

from app.models.bkpt_receivables_model import BKPtReceivable
from app.schemas.bkpt_receivables_schema import (
    BKPtReceivableCreate,
    BKPtReceivableUpdate,
)


class BKPtReceivableRepository:

    def get_all(
        self,
        db: Session,
        customer_name: str | None = None,
        month: int | None = None,
        year: int | None = None,
        no_invoice: str | None = None,
    ):
        query = db.query(BKPtReceivable)

        if customer_name:
            query = query.filter(BKPtReceivable.customer_name.ilike(f"%{customer_name}%"))

        if no_invoice:
            query = query.filter(BKPtReceivable.no_invoice.ilike(f"%{no_invoice}%"))

        if month:
            query = query.filter(extract("month", BKPtReceivable.tgl) == month)

        if year:
            query = query.filter(extract("year", BKPtReceivable.tgl) == year)

        return query.order_by(
            BKPtReceivable.customer_name.asc(),
            BKPtReceivable.tgl.asc().nulls_last(),
            BKPtReceivable.id.asc(),
        ).all()

    def get_by_id(self, db: Session, bkpt_id: int):
        return db.query(BKPtReceivable).filter(BKPtReceivable.id == bkpt_id).first()

    def create(self, db: Session, data: BKPtReceivableCreate):
        item = BKPtReceivable(**data.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item: BKPtReceivable, data: BKPtReceivableUpdate):
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(item, key, value)

        db.commit()
        db.refresh(item)
        return item

    def delete(self, db: Session, item: BKPtReceivable):
        db.delete(item)
        db.commit()
        return item