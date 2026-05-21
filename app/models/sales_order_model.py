from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.connection import Base


class SalesOrder(Base):

    __tablename__ = "sales_orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_number = Column(
        String,
        unique=True,
        nullable=False
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id")
    )

    order_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    deadline = Column(
        DateTime
    )

    status = Column(
        String,
        default="PENDING"
    )

    total_price = Column(
        Float,
        default=0
    )

    notes = Column(
        String
    )

    customer = relationship(
        "Customer"
    )

class SalesOrderItem(Base):

    __tablename__ = "sales_order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sales_order_id = Column(
        Integer,
        ForeignKey("sales_orders.id")
    )

    description = Column(
        String
    )

    qty = Column(
        Integer
    )

    unit_price = Column(
        Float
    )

    subtotal = Column(
        Float
    )

    sales_order = relationship(
        "SalesOrder"
    )