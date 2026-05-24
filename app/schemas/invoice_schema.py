from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class InvoiceCreate(BaseModel):
    production_order_id: int

    invoice_number: str
    invoice_date: Optional[date] = None

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None

    subtotal: Optional[Decimal] = 0
    ppn_percent: Optional[Decimal] = 11
    ppn_amount: Optional[Decimal] = 0
    grand_total: Optional[Decimal] = 0

    payment_status: Optional[str] = "UNPAID"
    note: Optional[str] = None


class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None

    subtotal: Optional[Decimal] = None
    ppn_percent: Optional[Decimal] = None
    ppn_amount: Optional[Decimal] = None
    grand_total: Optional[Decimal] = None

    payment_status: Optional[str] = None
    note: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: int
    production_order_id: int

    invoice_number: str
    invoice_date: Optional[date]

    customer_id: Optional[int]
    customer_name: Optional[str]

    subtotal: Optional[Decimal]
    ppn_percent: Optional[Decimal]
    ppn_amount: Optional[Decimal]
    grand_total: Optional[Decimal]

    payment_status: Optional[str]
    note: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True