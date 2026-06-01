from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Invoice103MetadataBase(BaseModel):
    no_invoice: str
    invoice_year: Optional[int] = None
    invoice_month: Optional[int] = None
    ship_to_name: Optional[str] = None
    ship_to_address: Optional[str] = None
    terms_of_payment: Optional[str] = "30 Days"


class Invoice103MetadataCreate(Invoice103MetadataBase):
    pass


class Invoice103MetadataUpdate(BaseModel):
    ship_to_name: Optional[str] = None
    ship_to_address: Optional[str] = None
    terms_of_payment: Optional[str] = None


class Invoice103MetadataResponse(Invoice103MetadataBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
