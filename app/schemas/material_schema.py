from pydantic import BaseModel


class MaterialCreateSchema(BaseModel):

    code: str
    name: str
    unit: str
    stock: int
    price: float
    supplier_id: int


class MaterialResponseSchema(
    MaterialCreateSchema
):

    id: int

    class Config:
        from_attributes = True