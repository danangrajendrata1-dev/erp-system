from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class ShipmentCreate(BaseModel):
    production_order_id: int

    delivery_note_number: Optional[str] = None
    shipment_date: Optional[date] = None

    customer_name: Optional[str] = None
    delivery_address: Optional[str] = None

    driver_name: Optional[str] = None
    expedition_name: Optional[str] = None

    shipped_quantity: Optional[Decimal] = 0
    unit: Optional[str] = None

    proof_file_url: Optional[str] = None
    note: Optional[str] = None


class ShipmentUpdate(BaseModel):
    delivery_note_number: Optional[str] = None
    shipment_date: Optional[date] = None

    customer_name: Optional[str] = None
    delivery_address: Optional[str] = None

    driver_name: Optional[str] = None
    expedition_name: Optional[str] = None

    shipped_quantity: Optional[Decimal] = None
    unit: Optional[str] = None

    proof_file_url: Optional[str] = None
    note: Optional[str] = None


class ShipmentResponse(BaseModel):
    id: int
    production_order_id: int

    delivery_note_number: Optional[str]
    shipment_date: Optional[date]

    customer_name: Optional[str]
    delivery_address: Optional[str]

    driver_name: Optional[str]
    expedition_name: Optional[str]

    shipped_quantity: Optional[Decimal]
    unit: Optional[str]

    proof_file_url: Optional[str]
    note: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True