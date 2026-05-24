from sqlalchemy import Column, Integer, String, Date, Numeric, Text, DateTime, func
from app.database.connection import Base


class BKPtReceivable(Base):
    __tablename__ = "bkpt_receivables"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String(255), nullable=False, index=True)

    tgl = Column(Date, nullable=True)
    no_order = Column(String(100), nullable=True, index=True)
    no_invoice = Column(String(100), nullable=True, index=True)
    faktur = Column(String(100), nullable=True, index=True)
    pr = Column(String(255), nullable=True)

    debet = Column(Numeric(18, 2), default=0)
    kredit = Column(Numeric(18, 2), default=0)
    pph_psl_21 = Column(Numeric(18, 2), default=0)
    pph_psl_23 = Column(Numeric(18, 2), default=0)
    saldo = Column(Numeric(18, 2), default=0)

    keterangan = Column(Text, nullable=True)

    sales_103_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)