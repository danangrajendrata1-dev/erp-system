from pydantic import BaseModel


class ProductCreateSchema(BaseModel):

    sku: str
    name: str
    category: str
    stock: int
    price: float


class ProductResponseSchema(BaseModel):

    id: int
    sku: str
    name: str
    category: str
    stock: int
    price: float

    class Config:
        from_attributes = True