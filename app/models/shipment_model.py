from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)

    production_order_id = Column(
        Integer,
        ForeignKey("production_orders.id", ondelete="CASCADE"),
        nullable=False
    )

    delivery_note_number = Column(String(100), nullable=True)
    shipment_date = Column(Date, nullable=True)

    customer_name = Column(String(255), nullable=True)
    delivery_address = Column(Text, nullable=True)

    driver_name = Column(String(255), nullable=True)
    expedition_name = Column(String(255), nullable=True)

    shipped_quantity = Column(Numeric(18, 2), default=0)
    unit = Column(String(50), nullable=True)

    proof_file_url = Column(Text, nullable=True)
    note = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())