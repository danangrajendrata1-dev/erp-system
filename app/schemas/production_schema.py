from pydantic import BaseModel


class ProductionCreateSchema(BaseModel):

    sales_order_id: int
    notes: str | None = None


class ProductionResponseSchema(BaseModel):

    id: int
    sales_order_id: int
    status: str

    class Config:
        from_attributes = True


class ProductionProgressSchema(BaseModel):

    production_order_id: int
    process_name: str
    status: str
    notes: str | None = None


class ProductionProgressResponseSchema(
    ProductionProgressSchema
):

    id: int

    class Config:
        from_attributes = True