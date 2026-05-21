from sqlalchemy.orm import Session

from app.models.inventory_model import (
    InventoryMovement
)

from app.models.material_model import (
    Material
)


def create_inventory_movement(
    db: Session,
    data
):

    material = db.query(Material).filter(
        Material.id == data.material_id
    ).first()

    if not material:
        return None

    # =========================
    # STOCK LOGIC
    # =========================

    if data.movement_type == "IN":

        material.stock += data.qty

    elif data.movement_type == "OUT":

        if material.stock < data.qty:
            return "stock_not_enough"

        material.stock -= data.qty

    movement = InventoryMovement(
        material_id=data.material_id,
        movement_type=data.movement_type,
        qty=data.qty,
        description=data.description
    )

    db.add(movement)

    db.commit()

    db.refresh(movement)

    return movement


def get_inventory_movements(
    db: Session
):

    return db.query(
        InventoryMovement
    ).all()