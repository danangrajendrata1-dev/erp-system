from pydantic import BaseModel


class SupplierCreateSchema(BaseModel):

    name: str
    phone: str | None = None
    address: str | None = None


class SupplierResponseSchema(
    SupplierCreateSchema
):

    id: int

    class Config:
        from_attributes = True