from pydantic import BaseModel


class CustomerCreateSchema(BaseModel):

    name: str
    phone: str | None = None
    address: str | None = None
    company: str | None = None


class CustomerResponseSchema(
    CustomerCreateSchema
):

    id: int

    class Config:
        from_attributes = True