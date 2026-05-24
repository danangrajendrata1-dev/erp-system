from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class ProductionProcessCreate(BaseModel):
    production_order_id: int
    process_type: str

    start_date: Optional[date] = None
    finish_date: Optional[date] = None

    operator_name: Optional[str] = None
    machine_name: Optional[str] = None

    input_quantity: Optional[Decimal] = 0
    output_quantity: Optional[Decimal] = 0
    reject_quantity: Optional[Decimal] = 0

    note: Optional[str] = None


class ProductionProcessUpdate(BaseModel):
    process_type: Optional[str] = None

    start_date: Optional[date] = None
    finish_date: Optional[date] = None

    operator_name: Optional[str] = None
    machine_name: Optional[str] = None

    input_quantity: Optional[Decimal] = None
    output_quantity: Optional[Decimal] = None
    reject_quantity: Optional[Decimal] = None

    note: Optional[str] = None


class ProductionProcessResponse(BaseModel):
    id: int
    production_order_id: int
    process_type: str

    start_date: Optional[date]
    finish_date: Optional[date]

    operator_name: Optional[str]
    machine_name: Optional[str]

    input_quantity: Optional[Decimal]
    output_quantity: Optional[Decimal]
    reject_quantity: Optional[Decimal]

    note: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True