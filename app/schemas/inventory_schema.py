from pydantic import BaseModel


class InventoryCreateSchema(BaseModel):

    material_id: int
    movement_type: str
    qty: int
    description: str


class InventoryResponseSchema(
    InventoryCreateSchema
):

    id: int

    class Config:
        from_attributes = True