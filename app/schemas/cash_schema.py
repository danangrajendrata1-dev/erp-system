from pydantic import BaseModel


class CashCreateSchema(BaseModel):

    transaction_type: str
    amount: float
    description: str


class CashResponseSchema(
    CashCreateSchema
):

    id: int

    class Config:
        from_attributes = True