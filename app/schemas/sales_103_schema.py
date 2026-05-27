from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class Sales103Base(BaseModel):
    tgl: Optional[date] = None
    no_ord: Optional[str] = None
    no_invoice: Optional[str] = None
    no_faktur: Optional[str] = None
    langganan: Optional[str] = None
    jenis_cetak: Optional[str] = None

    jml: Optional[Decimal] = None
    sat: Optional[str] = None
    harga: Optional[Decimal] = None

    dpp: Optional[Decimal] = None

    # PPN fleksibel
    ppn_rate: Optional[Decimal] = Decimal("11")
    ppn_adjustment: Optional[Decimal] = Decimal("0")
    ppn_keluar: Optional[Decimal] = None

    piutang_dagang: Optional[Decimal] = None

    production_order_id: Optional[int] = None
    keterangan: Optional[str] = None


class Sales103Create(Sales103Base):
    pass


class Sales103Update(BaseModel):
    tgl: Optional[date] = None
    no_ord: Optional[str] = None
    no_invoice: Optional[str] = None
    no_faktur: Optional[str] = None
    langganan: Optional[str] = None
    jenis_cetak: Optional[str] = None

    jml: Optional[Decimal] = None
    sat: Optional[str] = None
    harga: Optional[Decimal] = None

    dpp: Optional[Decimal] = None

    # PPN fleksibel
    ppn_rate: Optional[Decimal] = None
    ppn_adjustment: Optional[Decimal] = None
    ppn_keluar: Optional[Decimal] = None

    piutang_dagang: Optional[Decimal] = None

    production_order_id: Optional[int] = None
    keterangan: Optional[str] = None


class Sales103Response(Sales103Base):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Data tambahan dari BKOrder untuk kebutuhan cetak Invoice 103.
    # Ini bukan kolom baru Sales 103 dan tidak mengubah schema database.
    bkorder_order_date: Optional[date] = None
    bkorder_order_number: Optional[str] = None
    bkorder_po_date: Optional[date] = None
    bkorder_do_number: Optional[str] = None
    bkorder_delivery_date: Optional[date] = None
    bkorder_customer_name: Optional[str] = None

    # Alias sederhana supaya frontend lebih mudah fallback.
    po_date: Optional[date] = None
    do_number: Optional[str] = None
    order_number: Optional[str] = None
    delivery_date: Optional[date] = None

    class Config:
        from_attributes = True