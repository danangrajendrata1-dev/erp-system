from sqlalchemy import Column, DateTime, Integer, String, Text, func

from app.database.connection import Base


class Invoice103Metadata(Base):
    __tablename__ = "invoice_103_metadata"

    id = Column(Integer, primary_key=True, index=True)

    no_invoice = Column(String(100), nullable=False, unique=True, index=True)
    ship_to_name = Column(String(255), nullable=True)
    ship_to_address = Column(Text, nullable=True)
    terms_of_payment = Column(String(100), nullable=True, default="30 Days")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
