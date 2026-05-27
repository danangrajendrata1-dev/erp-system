from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.bkpt_receivables_repository import BKPtReceivableRepository
from app.schemas.bkpt_receivables_schema import (
    BKPtReceivableCreate,
    BKPtReceivableUpdate,
)


class BKPtReceivableService:

    def __init__(self):
        self.repository = BKPtReceivableRepository()

    def round_money(self, value):
        return Decimal(value or 0).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    def prepare_money_payload(self, data):
        update_data = {}

        for field in [
            "debet",
            "kredit",
            "pph_psl_21",
            "pph_psl_23",
            "saldo",
        ]:
            if getattr(data, field, None) is not None:
                update_data[field] = self.round_money(getattr(data, field))

        if not update_data:
            return data

        return data.model_copy(update=update_data)

    def get_all(
        self,
        db: Session,
        customer_name: str | None = None,
        month: int | None = None,
        year: int | None = None,
        no_invoice: str | None = None,
    ):
        return self.repository.get_all(
            db=db,
            customer_name=customer_name,
            month=month,
            year=year,
            no_invoice=no_invoice,
        )

    def get_by_id(self, db: Session, bkpt_id: int):
        item = self.repository.get_by_id(db, bkpt_id)

        if not item:
            raise HTTPException(status_code=404, detail="Data BKPt tidak ditemukan")

        return item

    def create(self, db: Session, data: BKPtReceivableCreate):
        return self.repository.create(db, self.prepare_money_payload(data))

    def update(self, db: Session, bkpt_id: int, data: BKPtReceivableUpdate):
        item = self.get_by_id(db, bkpt_id)
        return self.repository.update(db, item, self.prepare_money_payload(data))

    def delete(self, db: Session, bkpt_id: int):
        item = self.get_by_id(db, bkpt_id)
        return self.repository.delete(db, item)
