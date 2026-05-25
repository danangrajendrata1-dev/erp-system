from sqlalchemy import Column, Integer, String, Text, Date, Numeric, Boolean, DateTime, func

from app.database.connection import Base


class Bank103(Base):
    __tablename__ = "bank_103"

    id = Column(Integer, primary_key=True, index=True)

    tgl = Column(Date, nullable=True)
    kode = Column(String(50), nullable=True)
    keterangan = Column(Text, nullable=True)

    debet = Column(Numeric(18, 2), default=0)
    kredit = Column(Numeric(18, 2), default=0)
    saldo = Column(Numeric(18, 2), default=0)

    bkpt_receivable_id = Column(Integer, nullable=True)
    no_invoice = Column(String(100), nullable=True)
    customer_name = Column(String(255), nullable=True)

    is_used = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)