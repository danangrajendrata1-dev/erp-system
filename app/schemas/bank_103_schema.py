from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class Bank103Base(BaseModel):
    tgl: Optional[date] = None
    kode: Optional[str] = None
    keterangan: Optional[str] = None

    debet: Decimal = Decimal("0")
    kredit: Decimal = Decimal("0")
    saldo: Decimal = Decimal("0")

    bkpt_receivable_id: Optional[int] = None
    no_invoice: Optional[str] = None
    customer_name: Optional[str] = None

    is_used: bool = False


class Bank103Create(Bank103Base):
    pass


class Bank103Update(BaseModel):
    tgl: Optional[date] = None
    kode: Optional[str] = None
    keterangan: Optional[str] = None

    debet: Optional[Decimal] = None
    kredit: Optional[Decimal] = None
    saldo: Optional[Decimal] = None

    bkpt_receivable_id: Optional[int] = None
    no_invoice: Optional[str] = None
    customer_name: Optional[str] = None

    is_used: Optional[bool] = None


class Bank103Response(Bank103Base):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApplyBank103ToBKPtRequest(BaseModel):
    bkpt_receivable_id: int