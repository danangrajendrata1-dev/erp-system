from sqlalchemy.orm import Session

from app.models.customer_model import Customer


def create_customer(
    db: Session,
    data
):

    customer = Customer(
        name=data.name,
        phone=data.phone,
        address=data.address,
        company=data.company
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


def get_customers(db: Session):

    return db.query(Customer).all()


def get_customer_by_id(
    db: Session,
    customer_id: int
):

    return db.query(Customer).filter(
        Customer.id == customer_id
    ).first()


def update_customer(
    db: Session,
    customer_id: int,
    data
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        return None

    customer.name = data.name
    customer.phone = data.phone
    customer.address = data.address
    customer.company = data.company

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer(
    db: Session,
    customer_id: int
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        return None

    db.delete(customer)
    db.commit()

    return customer