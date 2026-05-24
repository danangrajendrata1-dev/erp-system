from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    production_order_id = Column(
        Integer,
        ForeignKey("production_orders.id", ondelete="CASCADE"),
        nullable=False
    )

    invoice_number = Column(String(100), nullable=False, index=True)
    invoice_date = Column(Date, nullable=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String(255), nullable=True)

    subtotal = Column(Numeric(18, 2), default=0)
    ppn_percent = Column(Numeric(5, 2), default=11)
    ppn_amount = Column(Numeric(18, 2), default=0)
    grand_total = Column(Numeric(18, 2), default=0)

    payment_status = Column(String(50), default="UNPAID")

    note = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())