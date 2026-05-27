from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    func,
)

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

    # Untuk kompatibilitas lama:
    # 1 Bank 103 -> 1 BKPt masih tetap aman.
    bkpt_receivable_id = Column(Integer, nullable=True)
    no_invoice = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=True)

    # Jika sudah dipakai ke BKPt, baik single maupun multi allocation.
    is_used = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)


class Bank103BKPtAllocation(Base):
    __tablename__ = "bank_103_bkpt_allocations"

    id = Column(Integer, primary_key=True, index=True)

    bank_103_id = Column(
        Integer,
        ForeignKey("bank_103.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    bkpt_receivable_id = Column(
        Integer,
        ForeignKey("bkpt_receivables.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    allocated_amount = Column(Numeric(18, 2), nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())