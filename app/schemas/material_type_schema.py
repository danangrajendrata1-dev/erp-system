from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class MaterialTypeBase(BaseModel):
    name: str
    width_cm: Decimal
    length_cm: Decimal
    is_active: bool = True


class MaterialTypeCreate(MaterialTypeBase):
    pass


class MaterialTypeUpdate(BaseModel):
    name: Optional[str] = None
    width_cm: Optional[Decimal] = None
    length_cm: Optional[Decimal] = None
    is_active: Optional[bool] = None


class MaterialTypeResponse(MaterialTypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True