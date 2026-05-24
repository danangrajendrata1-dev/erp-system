from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class MaterialReceiptCreate(BaseModel):
    production_order_id: int

    receipt_date: Optional[date] = None
    supplier_name: Optional[str] = None
    material_name: Optional[str] = None

    quantity: Optional[Decimal] = 0
    unit: Optional[str] = None

    note: Optional[str] = None


class MaterialReceiptUpdate(BaseModel):
    receipt_date: Optional[date] = None
    supplier_name: Optional[str] = None
    material_name: Optional[str] = None

    quantity: Optional[Decimal] = None
    unit: Optional[str] = None

    note: Optional[str] = None


class MaterialReceiptResponse(BaseModel):
    id: int
    production_order_id: int

    receipt_date: Optional[date]
    supplier_name: Optional[str]
    material_name: Optional[str]

    quantity: Optional[Decimal]
    unit: Optional[str]

    note: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True