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
        return self.repository.create(db, data)

    def update(self, db: Session, bkpt_id: int, data: BKPtReceivableUpdate):
        item = self.get_by_id(db, bkpt_id)
        return self.repository.update(db, item, data)

    def delete(self, db: Session, bkpt_id: int):
        item = self.get_by_id(db, bkpt_id)
        return self.repository.delete(db, item)