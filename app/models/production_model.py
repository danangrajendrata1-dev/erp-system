from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)

    order_date = Column(Date, nullable=True)
    order_number = Column(String(100), nullable=False, index=True)
    po_date = Column(Date, nullable=True)
    material_po_number = Column(String(100), nullable=True)
    delivery_date = Column(Date, nullable=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String(255), nullable=True, index=True)

    size = Column(String(100), nullable=True)
    material_type = Column(String(255), nullable=True)
    print_type = Column(String(255), nullable=True)
    specification = Column(Text, nullable=True)

    unit = Column(String(50), nullable=True)
    quantity = Column(Numeric(18, 2), default=0)
    rim = Column(Numeric(18, 2), default=0)
    price = Column(Numeric(18, 2), default=0)

    total_quantity = Column(Numeric(18, 2), default=0)
    partial_billing_quantity = Column(Numeric(18, 2), default=0)

    status = Column(String(50), default="PO_MASUK")
    note = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())