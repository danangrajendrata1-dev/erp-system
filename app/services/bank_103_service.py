from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.bank_103_repository import Bank103Repository
from app.schemas.bank_103_schema import Bank103Create, Bank103Update

from app.models.bkpt_receivables_model import BKPtReceivable


class Bank103Service:
    def __init__(self, db: Session):
        self.db = db
        self.repository = Bank103Repository(db)

    def get_all(self, kode=None, no_invoice=None, is_used=None):
        return self.repository.get_all(kode=kode, no_invoice=no_invoice, is_used=is_used)

    def get_by_id(self, bank_id: int):
        bank = self.repository.get_by_id(bank_id)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        return bank

    def get_available_bkpt_payments(self):
        return self.repository.get_available_bkpt_payments()

    def create(self, data: Bank103Create):
        return self.repository.create(data)

    def update(self, bank_id: int, data: Bank103Update):
        bank = self.repository.update(bank_id, data)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        return bank

    def delete(self, bank_id: int):
        bank = self.repository.delete(bank_id)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        return bank

    def apply_to_bkpt(self, bank_id: int, bkpt_receivable_id: int):
        bank = self.repository.get_by_id(bank_id)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        if bank.kode != "BkPt":
            raise HTTPException(
                status_code=400,
                detail="Hanya transaksi Bank 103 dengan KODE BkPt yang bisa dipakai untuk pembayaran BKPt",
            )

        if Decimal(bank.debet or 0) <= 0:
            raise HTTPException(
                status_code=400,
                detail="Transaksi Bank 103 harus memiliki DEBET lebih dari 0",
            )

        if bank.is_used:
            raise HTTPException(
                status_code=400,
                detail="Transaksi Bank 103 ini sudah pernah dipakai ke BKPt",
            )

        bkpt = (
            self.db.query(BKPtReceivable)
            .filter(BKPtReceivable.id == bkpt_receivable_id)
            .first()
        )

        if not bkpt:
            raise HTTPException(status_code=404, detail="Data BKPt tidak ditemukan")

        pembayaran = Decimal(bank.debet or 0)

        debet = Decimal(bkpt.debet or 0)
        kredit_lama = Decimal(bkpt.kredit or 0)
        pph21 = Decimal(bkpt.pph_psl_21 or 0)
        pph23 = Decimal(bkpt.pph_psl_23 or 0)

        kredit_baru = kredit_lama + pembayaran
        saldo_baru = debet - kredit_baru - pph21 - pph23

        if saldo_baru < 0:
            saldo_baru = Decimal("0")

        bkpt.kredit = kredit_baru
        bkpt.saldo = saldo_baru

        if not bkpt.keterangan:
            bkpt.keterangan = bank.keterangan
        else:
            bkpt.keterangan = f"{bkpt.keterangan}\nPembayaran Bank 103: {bank.keterangan}"

        bank.bkpt_receivable_id = bkpt.id
        bank.no_invoice = bkpt.no_invoice
        bank.customer_name = bkpt.customer_name
        bank.is_used = True

        self.db.commit()
        self.db.refresh(bank)
        self.db.refresh(bkpt)

        return {
            "status": "success",
            "message": "Bank 103 berhasil dipakai untuk update pembayaran BKPt",
            "bank_103": bank,
            "bkpt": bkpt,
        }