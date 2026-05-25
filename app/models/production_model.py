from sqlalchemy import Column, Date, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB

from app.database.connection import Base


class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)

    # BKOrder sesuai Excel client terbaru
    order_date = Column(Date, nullable=True)  # TGL
    order_number = Column(String(100), index=True, nullable=True)  # NO.ORD
    po_date = Column(Date, nullable=True)  # PO Date
    do_number = Column(String(100), index=True, nullable=True)  # DO NUMBER
    delivery_date = Column(Date, nullable=True)  # Deliv. Date
    customer_name = Column(String(255), index=True, nullable=True)  # PR
    size = Column(String(100), nullable=True)  # UKURAN
    material_type = Column(String(255), nullable=True)  # JENIS BAHAN
    print_type = Column(String(255), nullable=True)  # JENIS CETAK
    specification = Column(Text, nullable=True)  # SPESIFIKASI
    unit = Column(String(50), nullable=True)  # SAT
    quantity = Column(Numeric(18, 2), nullable=True, default=0)  # JUMLAH
    rim = Column(Numeric(18, 2), nullable=True, default=0)  # Rim
    price = Column(Numeric(18, 2), nullable=True, default=0)  # HARGA

    # O:AB di Excel. Disimpan JSON array 14 item tanggal string YYYY-MM-DD/null.
    delivery_completed_dates = Column(JSONB, nullable=True, default=list)  # TGL KIRIM / SELESAI

    # AC:AP di Excel. Disimpan JSON array 14 item angka.
    partial_billing_quantities = Column(JSONB, nullable=True, default=list)  # TAGIHAN PARSIAL (Keping)

    total_keping = Column(Numeric(18, 2), nullable=True, default=0)  # TOTAL (Keping)
    status = Column(String(50), nullable=True, default="OPEN")  # STATUS
    notes = Column(Text, nullable=True)

    # Kolom lama dibiarkan tetap ada supaya data lama tidak rusak.
    material_po_number = Column(String(100), nullable=True)
    delivery_completed_date = Column(Date, nullable=True)
    partial_billing_quantity = Column(Numeric(18, 2), nullable=True, default=0)
    total_quantity = Column(Numeric(18, 2), nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
