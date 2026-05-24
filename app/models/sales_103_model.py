from sqlalchemy import Column, Integer, String, Date, Numeric, Text, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Sales103(Base):
    __tablename__ = "sales_103"

    id = Column(Integer, primary_key=True, index=True)

    # Sesuai sheet Excel 103
    tgl = Column(Date, nullable=True)
    no_ord = Column(String(100), nullable=True)
    no_invoice = Column(String(100), nullable=True)
    no_faktur = Column(String(100), nullable=True)
    langganan = Column(String(255), nullable=True)
    jenis_cetak = Column(String(255), nullable=True)

    jml = Column(Numeric(18, 2), nullable=True)
    sat = Column(String(50), nullable=True)
    harga = Column(Numeric(18, 2), nullable=True)

    dpp = Column(Numeric(18, 2), nullable=True)

    # PPN fleksibel
    ppn_rate = Column(Numeric(5, 2), nullable=True, default=11)
    ppn_adjustment = Column(Numeric(18, 2), nullable=True, default=0)
    ppn_keluar = Column(Numeric(18, 2), nullable=True)

    piutang_dagang = Column(Numeric(18, 2), nullable=True)

    production_order_id = Column(Integer, nullable=True)
    keterangan = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())