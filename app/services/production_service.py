from sqlalchemy.orm import Session

from app.models.production_model import (
    ProductionOrder,
    ProductionProgress
)

from app.models.sales_order_model import (
    SalesOrder
)


def create_production_order(
    db: Session,
    data
):

    sales_order = db.query(SalesOrder).filter(
        SalesOrder.id == data.sales_order_id
    ).first()

    if not sales_order:
        return None

    production = ProductionOrder(
        sales_order_id=data.sales_order_id,
        notes=data.notes
    )

    sales_order.status = "PRODUCTION"

    db.add(production)

    db.commit()

    db.refresh(production)

    return production


def get_production_orders(
    db: Session
):

    return db.query(
        ProductionOrder
    ).all()


def create_progress(
    db: Session,
    data
):

    production = db.query(
        ProductionOrder
    ).filter(
        ProductionOrder.id ==
        data.production_order_id
    ).first()

    if not production:
        return None

    progress = ProductionProgress(
        production_order_id=data.production_order_id,
        process_name=data.process_name,
        status=data.status,
        notes=data.notes
    )

    db.add(progress)

    # ======================
    # AUTO STATUS
    # ======================

    if data.status == "DONE":

        production.status = "FINISHED"

    else:

        production.status = "ON PROGRESS"

    db.commit()

    db.refresh(progress)

    return progress


def get_progress_list(
    db: Session
):

    return db.query(
        ProductionProgress
    ).all()