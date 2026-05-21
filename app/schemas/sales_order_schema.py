from pydantic import BaseModel
from datetime import datetime


class SalesOrderItemSchema(BaseModel):

    description: str
    qty: int
    unit_price: float


class SalesOrderCreateSchema(BaseModel):

    order_number: str
    customer_id: int
    deadline: datetime
    notes: str | None = None

    items: list[SalesOrderItemSchema]


class SalesOrderResponseSchema(BaseModel):

    id: int
    order_number: str
    customer_id: int
    status: str
    total_price: float

    class Config:
        from_attributes = True