from datetime import date, datetime
from decimal import Decimal
from typing import Any, List, Optional

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
    partial_billing_quantities: Optional[List[Optional[float]]] = Field(default_factory=list)
    partial_billing_input_quantities: Optional[List[Optional[float]]] = Field(default_factory=list)

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


class BKOrderImportRow(BaseModel):
    row_number: int
    data: dict[str, Any]
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    is_valid: bool = True
    is_header_row: bool = False


class BKOrderImportGroup(BaseModel):
    order_number: Optional[str] = None
    customer_name: Optional[str] = None
    order_date: Optional[str] = None
    po_date: Optional[str] = None
    do_number: Optional[str] = None
    delivery_date: Optional[str] = None
    row_count: int = 0
    valid_count: int = 0
    error_count: int = 0
    duplicate_count: int = 0
    rows: List[BKOrderImportRow] = Field(default_factory=list)


class BKOrderImportPreviewResponse(BaseModel):
    groups: List[BKOrderImportGroup]
    rows: List[BKOrderImportRow]
    valid_count: int
    error_count: int
    duplicate_count: int


class BKOrderImportCommitRequest(BaseModel):
    rows: List[dict[str, Any]]


class BKOrderImportCommitResponse(BaseModel):
    success: bool = True
    success_count: int
    failed_count: int
    duplicate_count: int
    errors: List[dict[str, Any]] = Field(default_factory=list)
