from sqlalchemy.orm import Session

from app.models.material_model import Material


def create_material(
    db: Session,
    data
):

    material = Material(
        code=data.code,
        name=data.name,
        unit=data.unit,
        stock=data.stock,
        price=data.price,
        supplier_id=data.supplier_id
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    return material


def get_materials(db: Session):

    return db.query(Material).all()


def get_material_by_id(
    db: Session,
    material_id: int
):

    return db.query(Material).filter(
        Material.id == material_id
    ).first()


def update_material(
    db: Session,
    material_id: int,
    data
):

    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        return None

    material.code = data.code
    material.name = data.name
    material.unit = data.unit
    material.stock = data.stock
    material.price = data.price
    material.supplier_id = data.supplier_id

    db.commit()
    db.refresh(material)

    return material


def delete_material(
    db: Session,
    material_id: int
):

    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        return None

    db.delete(material)
    db.commit()

    return material