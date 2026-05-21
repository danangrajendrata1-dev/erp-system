from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.connection import Base


class ProductionOrder(Base):

    __tablename__ = "production_orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sales_order_id = Column(
        Integer,
        ForeignKey("sales_orders.id")
    )

    start_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    end_date = Column(
        DateTime,
        nullable=True
    )

    status = Column(
        String,
        default="WAITING"
    )

    notes = Column(
        String,
        nullable=True
    )

    sales_order = relationship(
        "SalesOrder"
    )

class ProductionProgress(Base):

    __tablename__ = "production_progress"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    production_order_id = Column(
        Integer,
        ForeignKey("production_orders.id")
    )

    process_name = Column(
        String
    )

    status = Column(
        String,
        default="PENDING"
    )

    notes = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    production_order = relationship(
        "ProductionOrder"
    )