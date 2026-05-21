from sqlalchemy.orm import Session

from app.models.product_model import Product


def create_product(
    db: Session,
    data
):

    product = Product(
        sku=data.sku,
        name=data.name,
        category=data.category,
        stock=data.stock,
        price=data.price
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_products(db: Session):

    return db.query(Product).all()


def get_product_by_id(
    db: Session,
    product_id: int
):

    return db.query(Product).filter(
        Product.id == product_id
    ).first()


def update_product(
    db: Session,
    product_id: int,
    data
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        return None

    product.sku = data.sku
    product.name = data.name
    product.category = data.category
    product.stock = data.stock
    product.price = data.price

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product_id: int
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        return None

    db.delete(product)
    db.commit()

    return product