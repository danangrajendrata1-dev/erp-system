from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class BKOrderBase(BaseModel):
    order_date: Optional[date] = None
    order_number: Optional[str] = None
    po_date: Optional[date] = None
    do_number: Optional[str] = None
    delivery_date: Optional[date] = None
    customer_name: Optional[str] = None
    size: Optional[str] = None
    material_type: Optional[str] = None
    print_type: Optional[str] = None
    specification: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[Decimal] = Decimal("0")
    rim: Optional[Decimal] = Decimal("0")
    price: Optional[Decimal] = Decimal("0")

    # 14 kolom sesuai O:AB Excel
    delivery_completed_dates: List[Optional[str]] = Field(default_factory=list)

    # 14 kolom sesuai AC:AP Excel
    partial_billing_quantities: List[Optional[float]] = Field(default_factory=list)

    total_keping: Optional[Decimal] = Decimal("0")
    status: Optional[str] = "OPEN"
    notes: Optional[str] = None


class BKOrderCreate(BKOrderBase):
    pass


class BKOrderUpdate(BKOrderBase):
    pass


class BKOrderResponse(BKOrderBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
