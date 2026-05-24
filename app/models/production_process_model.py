from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class ProductionProcess(Base):
    __tablename__ = "production_processes"

    id = Column(Integer, primary_key=True, index=True)

    production_order_id = Column(
        Integer,
        ForeignKey("production_orders.id", ondelete="CASCADE"),
        nullable=False
    )

    process_type = Column(String(50), nullable=False)  # POTONG / CETAK / FINISHING

    start_date = Column(Date, nullable=True)
    finish_date = Column(Date, nullable=True)

    operator_name = Column(String(255), nullable=True)
    machine_name = Column(String(255), nullable=True)

    input_quantity = Column(Numeric(18, 2), default=0)
    output_quantity = Column(Numeric(18, 2), default=0)
    reject_quantity = Column(Numeric(18, 2), default=0)

    note = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())