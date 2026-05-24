from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class MaterialReceipt(Base):
    __tablename__ = "material_receipts"

    id = Column(Integer, primary_key=True, index=True)

    production_order_id = Column(
        Integer,
        ForeignKey("production_orders.id", ondelete="CASCADE"),
        nullable=False
    )

    receipt_date = Column(Date, nullable=True)
    supplier_name = Column(String(255), nullable=True)
    material_name = Column(String(255), nullable=True)

    quantity = Column(Numeric(18, 2), default=0)
    unit = Column(String(50), nullable=True)

    note = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())