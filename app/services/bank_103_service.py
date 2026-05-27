from decimal import Decimal
import re

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
        bank = self.repository.create(data)
        self._auto_apply_to_matching_bkpt(bank)
        self.db.refresh(bank)

        return bank

    def update(self, bank_id: int, data: Bank103Update):
        bank = self.repository.update(bank_id, data)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        self._auto_apply_to_matching_bkpt(bank)
        self.db.refresh(bank)

        return bank

    def delete(self, bank_id: int):
        bank = self.repository.delete(bank_id)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        return bank

    def _normalize_code(self, value):
        return str(value or "").strip().lower()

    def _normalize_match_text(self, value):
        return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())

    def _text_contains_invoice(self, text, invoice):
        normalized_invoice = self._normalize_match_text(invoice)

        if not normalized_invoice:
            return False

        pattern = (
            r"(?<![a-z0-9])"
            + r"[^a-z0-9]*".join(map(re.escape, normalized_invoice))
            + r"(?![a-z0-9])"
        )

        return re.search(pattern, str(text or "").lower()) is not None

    def _is_available_bkpt_payment(self, bank):
        return (
            self._normalize_code(bank.kode) == "bkpt"
            and Decimal(bank.debet or 0) > 0
            and not bank.is_used
        )

    def _get_bkpt_saldo(self, bkpt):
        saldo = Decimal(bkpt.saldo or 0)

        if saldo > 0:
            return saldo

        debet = Decimal(bkpt.debet or 0)
        kredit = Decimal(bkpt.kredit or 0)
        pph21 = Decimal(bkpt.pph_psl_21 or 0)
        pph23 = Decimal(bkpt.pph_psl_23 or 0)

        return debet - kredit - pph21 - pph23

    def _find_matching_bkpt(self, bank):
        if not self._is_available_bkpt_payment(bank):
            return None

        invoice_from_bank = self._normalize_match_text(bank.no_invoice)

        if not invoice_from_bank and not bank.keterangan:
            return None

        candidates = (
            self.db.query(BKPtReceivable)
            .filter(BKPtReceivable.no_invoice.isnot(None))
            .all()
        )

        matches = []

        for bkpt in candidates:
            if self._get_bkpt_saldo(bkpt) <= 0:
                continue

            bkpt_invoice = self._normalize_match_text(bkpt.no_invoice)

            if not bkpt_invoice:
                continue

            exact_invoice_match = (
                invoice_from_bank and bkpt_invoice == invoice_from_bank
            )
            invoice_found_in_text = (
                not invoice_from_bank
                and self._text_contains_invoice(bank.keterangan, bkpt.no_invoice)
            )

            if exact_invoice_match or invoice_found_in_text:
                matches.append(bkpt)

        unique_matches = {item.id: item for item in matches}

        if len(unique_matches) != 1:
            return None

        return next(iter(unique_matches.values()))

    def _auto_apply_to_matching_bkpt(self, bank):
        matched_bkpt = self._find_matching_bkpt(bank)

        if not matched_bkpt:
            return None

        return self.apply_to_bkpt(bank.id, matched_bkpt.id)

    def auto_apply_to_bkpt(self, bank_id: int):
        bank = self.get_by_id(bank_id)
        result = self._auto_apply_to_matching_bkpt(bank)

        if not result:
            return {
                "status": "skipped",
                "message": "Belum ada BKPt yang cocok secara otomatis untuk transaksi Bank 103 ini",
                "bank_103": bank,
            }

        return result

    def apply_to_bkpt(self, bank_id: int, bkpt_receivable_id: int):
        bank = self.repository.get_by_id(bank_id)

        if not bank:
            raise HTTPException(status_code=404, detail="Data Bank 103 tidak ditemukan")

        if self._normalize_code(bank.kode) != "bkpt":
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
