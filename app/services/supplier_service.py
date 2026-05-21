from sqlalchemy.orm import Session

from app.models.supplier_model import Supplier


def create_supplier(
    db: Session,
    data
):

    supplier = Supplier(
        name=data.name,
        phone=data.phone,
        address=data.address
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def get_suppliers(db: Session):

    return db.query(Supplier).all()


def get_supplier_by_id(
    db: Session,
    supplier_id: int
):

    return db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()


def update_supplier(
    db: Session,
    supplier_id: int,
    data
):

    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not supplier:
        return None

    supplier.name = data.name
    supplier.phone = data.phone
    supplier.address = data.address

    db.commit()
    db.refresh(supplier)

    return supplier


def delete_supplier(
    db: Session,
    supplier_id: int
):

    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not supplier:
        return None

    db.delete(supplier)
    db.commit()

    return supplier