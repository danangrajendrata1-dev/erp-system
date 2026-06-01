from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class BKPtReceivableBase(BaseModel):
    customer_name: str

    tgl: Optional[date] = None
    invoice_year: Optional[int] = None
    invoice_month: Optional[int] = None
    no_order: Optional[str] = None
    no_invoice: Optional[str] = None
    faktur: Optional[str] = None
    pr: Optional[str] = None

    debet: Optional[Decimal] = 0
    kredit: Optional[Decimal] = 0
    pph_psl_21: Optional[Decimal] = 0
    pph_psl_23: Optional[Decimal] = 0
    saldo: Optional[Decimal] = 0

    keterangan: Optional[str] = None
    sales_103_id: Optional[int] = None


class BKPtReceivableCreate(BKPtReceivableBase):
    pass


class BKPtReceivableUpdate(BaseModel):
    customer_name: Optional[str] = None

    tgl: Optional[date] = None
    invoice_year: Optional[int] = None
    invoice_month: Optional[int] = None
    no_order: Optional[str] = None
    no_invoice: Optional[str] = None
    faktur: Optional[str] = None
    pr: Optional[str] = None

    debet: Optional[Decimal] = None
    kredit: Optional[Decimal] = None
    pph_psl_21: Optional[Decimal] = None
    pph_psl_23: Optional[Decimal] = None
    saldo: Optional[Decimal] = None

    keterangan: Optional[str] = None
    sales_103_id: Optional[int] = None


class BKPtReceivableResponse(BKPtReceivableBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
