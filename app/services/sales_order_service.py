from sqlalchemy.orm import Session

from app.models.sales_order_model import (
    SalesOrder,
    SalesOrderItem
)

from app.models.customer_model import Customer


def create_sales_order(
    db: Session,
    data
):

    customer = db.query(Customer).filter(
        Customer.id == data.customer_id
    ).first()

    if not customer:
        return None

    total_price = 0

    sales_order = SalesOrder(
        order_number=data.order_number,
        customer_id=data.customer_id,
        deadline=data.deadline,
        notes=data.notes
    )

    db.add(sales_order)
    db.flush()

    for item in data.items:

        subtotal = (
            item.qty *
            item.unit_price
        )

        total_price += subtotal

        order_item = SalesOrderItem(
            sales_order_id=sales_order.id,
            description=item.description,
            qty=item.qty,
            unit_price=item.unit_price,
            subtotal=subtotal
        )

        db.add(order_item)

    sales_order.total_price = total_price

    db.commit()

    db.refresh(sales_order)

    return sales_order


def get_sales_orders(
    db: Session
):

    return db.query(SalesOrder).all()