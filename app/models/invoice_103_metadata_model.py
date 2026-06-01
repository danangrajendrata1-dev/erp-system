from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint, func

from app.database.connection import Base


class Invoice103Metadata(Base):
    __tablename__ = "invoice_103_metadata"
    __table_args__ = (
        UniqueConstraint(
            "no_invoice",
            "invoice_year",
            "invoice_month",
            name="uq_invoice_103_metadata_invoice_period",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    no_invoice = Column(String(100), nullable=False, index=True)
    invoice_year = Column(Integer, nullable=True, index=True)
    invoice_month = Column(Integer, nullable=True, index=True)
    ship_to_name = Column(String(255), nullable=True)
    ship_to_address = Column(Text, nullable=True)
    terms_of_payment = Column(String(100), nullable=True, default="30 Days")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
