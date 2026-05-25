from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.bank_103_model import Bank103
from app.schemas.bank_103_schema import Bank103Create, Bank103Update


class Bank103Repository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        kode: Optional[str] = None,
        no_invoice: Optional[str] = None,
        is_used: Optional[bool] = None,
    ):
        query = self.db.query(Bank103)

        if kode:
            query = query.filter(Bank103.kode == kode)

        if no_invoice:
            query = query.filter(Bank103.no_invoice.ilike(f"%{no_invoice}%"))

        if is_used is not None:
            query = query.filter(Bank103.is_used == is_used)

        return query.order_by(Bank103.tgl.desc().nullslast(), Bank103.id.desc()).all()

    def get_by_id(self, bank_id: int):
        return self.db.query(Bank103).filter(Bank103.id == bank_id).first()

    def get_available_bkpt_payments(self):
        return (
            self.db.query(Bank103)
            .filter(Bank103.kode == "BkPt")
            .filter(Bank103.debet > 0)
            .filter(Bank103.is_used == False)  # noqa: E712
            .order_by(Bank103.tgl.desc().nullslast(), Bank103.id.desc())
            .all()
        )

    def create(self, data: Bank103Create):
        bank = Bank103(**data.model_dump())

        self.db.add(bank)
        self.db.commit()
        self.db.refresh(bank)

        return bank

    def update(self, bank_id: int, data: Bank103Update):
        bank = self.get_by_id(bank_id)

        if not bank:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(bank, key, value)

        bank.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(bank)

        return bank

    def delete(self, bank_id: int):
        bank = self.get_by_id(bank_id)

        if not bank:
            return None

        self.db.delete(bank)
        self.db.commit()

        return bank