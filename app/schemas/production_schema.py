from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class ProductionOrderCreate(BaseModel):
    order_date: Optional[date] = None
    order_number: str
    po_date: Optional[date] = None
    material_po_number: Optional[str] = None
    delivery_date: Optional[date] = None

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None

    size: Optional[str] = None
    material_type: Optional[str] = None
    print_type: Optional[str] = None
    specification: Optional[str] = None

    unit: Optional[str] = None
    quantity: Optional[Decimal] = 0
    rim: Optional[Decimal] = 0
    price: Optional[Decimal] = 0

    total_quantity: Optional[Decimal] = 0
    partial_billing_quantity: Optional[Decimal] = 0

    status: Optional[str] = "PO_MASUK"
    note: Optional[str] = None


class ProductionOrderUpdate(BaseModel):
    order_date: Optional[date] = None
    order_number: Optional[str] = None
    po_date: Optional[date] = None
    material_po_number: Optional[str] = None
    delivery_date: Optional[date] = None

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None

    size: Optional[str] = None
    material_type: Optional[str] = None
    print_type: Optional[str] = None
    specification: Optional[str] = None

    unit: Optional[str] = None
    quantity: Optional[Decimal] = None
    rim: Optional[Decimal] = None
    price: Optional[Decimal] = None

    total_quantity: Optional[Decimal] = None
    partial_billing_quantity: Optional[Decimal] = None

    status: Optional[str] = None
    note: Optional[str] = None


class ProductionOrderResponse(BaseModel):
    id: int

    order_date: Optional[date]
    order_number: str
    po_date: Optional[date]
    material_po_number: Optional[str]
    delivery_date: Optional[date]

    customer_id: Optional[int]
    customer_name: Optional[str]

    size: Optional[str]
    material_type: Optional[str]
    print_type: Optional[str]
    specification: Optional[str]

    unit: Optional[str]
    quantity: Optional[Decimal]
    rim: Optional[Decimal]
    price: Optional[Decimal]

    total_quantity: Optional[Decimal]
    partial_billing_quantity: Optional[Decimal]

    status: Optional[str]
    note: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True