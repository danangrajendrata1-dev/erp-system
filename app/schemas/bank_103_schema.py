from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class Bank103Base(BaseModel):
    tgl: Optional[date] = None
    kode: Optional[str] = None
    keterangan: Optional[str] = None

    debet: Decimal = Decimal("0")
    kredit: Decimal = Decimal("0")
    saldo: Decimal = Decimal("0")

    # Kompatibilitas lama:
    # masih dipakai untuk alokasi 1 Bank 103 -> 1 BKPt
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


class Bank103BKPtAllocationItem(BaseModel):
    bkpt_receivable_id: int
    amount: Decimal = Field(gt=Decimal("0"))

    @field_validator("amount", mode="before")
    @classmethod
    def validate_amount(cls, value):
        if value is None or value == "":
            raise ValueError("Amount alokasi wajib diisi")

        return Decimal(str(value))


class AllocateBank103ToMultipleBKPtRequest(BaseModel):
    allocations: List[Bank103BKPtAllocationItem]

    @field_validator("allocations")
    @classmethod
    def validate_allocations(cls, value):
        if not value:
            raise ValueError("Minimal pilih 1 data BKPt untuk alokasi")

        seen_ids = set()

        for item in value:
            if item.bkpt_receivable_id in seen_ids:
                raise ValueError("Data BKPt tidak boleh dipilih lebih dari satu kali")

            seen_ids.add(item.bkpt_receivable_id)

        return value


class Bank103BKPtAllocationResponse(BaseModel):
    id: int
    bank_103_id: int
    bkpt_receivable_id: int
    allocated_amount: Decimal
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True