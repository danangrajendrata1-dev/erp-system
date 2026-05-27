from decimal import Decimal, ROUND_HALF_UP
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
        return self.repository.get_all(
            kode=kode,
            no_invoice=no_invoice,
            is_used=is_used,
        )

    def get_by_id(self, bank_id: int):
        bank = self.repository.get_by_id(bank_id)

        if not bank:
            raise HTTPException(
                status_code=404,
                detail="Data Bank 103 tidak ditemukan",
            )

        return bank

    def get_available_bkpt_payments(self):
        return self.repository.get_available_bkpt_payments()

    def create(self, data: Bank103Create):
        bank = self.repository.create(self._prepare_money_payload(data))

        # Auto tetap dibuat ketat.
        # Jika tidak yakin, sistem skip dan user bisa alokasi manual.
        self._auto_apply_to_matching_bkpt(bank)
        self.db.refresh(bank)

        return bank

    def update(self, bank_id: int, data: Bank103Update):
        bank = self.repository.update(bank_id, self._prepare_money_payload(data))

        if not bank:
            raise HTTPException(
                status_code=404,
                detail="Data Bank 103 tidak ditemukan",
            )

        # Auto tetap dibuat ketat.
        # Jika tidak yakin, sistem skip dan user bisa alokasi manual.
        self._auto_apply_to_matching_bkpt(bank)
        self.db.refresh(bank)

        return bank

    def delete(self, bank_id: int):
        bank = self.repository.delete(bank_id)

        if not bank:
            raise HTTPException(
                status_code=404,
                detail="Data Bank 103 tidak ditemukan",
            )

        return bank

    def _to_decimal(self, value):
        if value is None or value == "":
            return Decimal("0")

        try:
            return Decimal(str(value)).quantize(
                Decimal("1"),
                rounding=ROUND_HALF_UP,
            )
        except Exception:
            return Decimal("0")

    def _prepare_money_payload(self, data):
        update_data = {}

        for field in ["debet", "kredit", "saldo"]:
            if getattr(data, field, None) is not None:
                update_data[field] = self._to_decimal(getattr(data, field))

        if not update_data:
            return data

        return data.model_copy(update=update_data)

    def _normalize_code(self, value):
        return str(value or "").strip().lower()

    def _normalize_match_text(self, value):
        return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())

    def _normalize_customer(self, value):
        text = str(value or "").lower().strip()

        text = re.sub(r"\b(pt|cv|tbk|ud|pd)\b", "", text)
        text = re.sub(r"[^a-z0-9]+", "", text)

        return text

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
            and self._to_decimal(bank.debet) > 0
            and not bank.is_used
        )

    def _get_bkpt_saldo(self, bkpt):
        saldo = self._to_decimal(bkpt.saldo)

        if saldo > 0:
            return saldo

        debet = self._to_decimal(bkpt.debet)
        kredit = self._to_decimal(bkpt.kredit)
        pph21 = self._to_decimal(bkpt.pph_psl_21)
        pph23 = self._to_decimal(bkpt.pph_psl_23)

        return debet - kredit - pph21 - pph23

    def _validate_bank_can_be_used_for_bkpt(self, bank):
        if not bank:
            raise HTTPException(
                status_code=404,
                detail="Data Bank 103 tidak ditemukan",
            )

        if self._normalize_code(bank.kode) != "bkpt":
            raise HTTPException(
                status_code=400,
                detail="Hanya transaksi Bank 103 dengan KODE BkPt yang bisa dipakai untuk pembayaran BKPt",
            )

        if self._to_decimal(bank.debet) <= 0:
            raise HTTPException(
                status_code=400,
                detail="Transaksi Bank 103 harus memiliki DEBET lebih dari 0",
            )

        if bank.is_used:
            raise HTTPException(
                status_code=400,
                detail="Transaksi Bank 103 ini sudah pernah dipakai ke BKPt",
            )

    def _find_matching_bkpt(self, bank):
        if not self._is_available_bkpt_payment(bank):
            return None

        invoice_from_bank = self._normalize_match_text(bank.no_invoice)

        if not invoice_from_bank and not bank.keterangan:
            return None

        bank_debet = self._to_decimal(bank.debet)

        candidates = (
            self.db.query(BKPtReceivable)
            .filter(BKPtReceivable.no_invoice.isnot(None))
            .all()
        )

        matches = []

        for bkpt in candidates:
            bkpt_saldo = self._get_bkpt_saldo(bkpt)

            if bkpt_saldo <= 0:
                continue

            # Auto tidak boleh melebihi saldo invoice.
            if bank_debet > bkpt_saldo:
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

        # Kalau kandidat lebih dari satu, jangan paksa auto.
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

        self._validate_bank_can_be_used_for_bkpt(bank)

        bkpt = (
            self.db.query(BKPtReceivable)
            .filter(BKPtReceivable.id == bkpt_receivable_id)
            .first()
        )

        if not bkpt:
            raise HTTPException(
                status_code=404,
                detail="Data BKPt tidak ditemukan",
            )

        pembayaran = self._to_decimal(bank.debet)
        saldo_lama = self._get_bkpt_saldo(bkpt)

        if pembayaran > saldo_lama:
            raise HTTPException(
                status_code=400,
                detail="Nominal pembayaran Bank 103 lebih besar dari saldo BKPt",
            )

        debet = self._to_decimal(bkpt.debet)
        kredit_lama = self._to_decimal(bkpt.kredit)
        pph21 = self._to_decimal(bkpt.pph_psl_21)
        pph23 = self._to_decimal(bkpt.pph_psl_23)

        kredit_baru = kredit_lama + pembayaran
        saldo_baru = debet - kredit_baru - pph21 - pph23

        if saldo_baru < 0:
            saldo_baru = Decimal("0")

        bkpt.kredit = kredit_baru
        bkpt.saldo = saldo_baru

        if not bkpt.keterangan:
            bkpt.keterangan = bank.keterangan
        else:
            bkpt.keterangan = (
                f"{bkpt.keterangan}\n"
                f"Pembayaran Bank 103: {bank.keterangan}"
            )

        bank.bkpt_receivable_id = bkpt.id
        bank.no_invoice = bkpt.no_invoice
        bank.customer_name = bkpt.customer_name
        bank.is_used = True

        # Simpan juga ke tabel allocation agar histori tetap konsisten.
        self.repository.create_allocation(
            bank_103_id=bank.id,
            bkpt_receivable_id=bkpt.id,
            allocated_amount=pembayaran,
        )

        self.db.commit()
        self.db.refresh(bank)
        self.db.refresh(bkpt)

        allocations = self.repository.get_allocations_by_bank_id(bank.id)

        return {
            "status": "success",
            "message": "Bank 103 berhasil dipakai untuk update pembayaran BKPt",
            "bank_103": bank,
            "bkpt": bkpt,
            "allocations": allocations,
        }

    def allocate_to_multiple_bkpt(self, bank_id: int, allocations):
        bank = self.repository.get_by_id(bank_id)

        self._validate_bank_can_be_used_for_bkpt(bank)

        if not allocations:
            raise HTTPException(
                status_code=400,
                detail="Minimal pilih 1 data BKPt untuk alokasi",
            )

        bank_debet = self._to_decimal(bank.debet)

        total_allocation = sum(
            self._to_decimal(item.amount)
            for item in allocations
        )

        if total_allocation != bank_debet:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Total alokasi harus sama dengan DEBET Bank 103. "
                    f"DEBET Bank 103: {bank_debet}, total alokasi: {total_allocation}"
                ),
            )

        bkpt_ids = [item.bkpt_receivable_id for item in allocations]

        if len(bkpt_ids) != len(set(bkpt_ids)):
            raise HTTPException(
                status_code=400,
                detail="Data BKPt tidak boleh dipilih lebih dari satu kali",
            )

        bkpt_map = {}

        for bkpt_id in bkpt_ids:
            bkpt = (
                self.db.query(BKPtReceivable)
                .filter(BKPtReceivable.id == bkpt_id)
                .first()
            )

            if not bkpt:
                raise HTTPException(
                    status_code=404,
                    detail=f"Data BKPt ID {bkpt_id} tidak ditemukan",
                )

            bkpt_map[bkpt_id] = bkpt

        # Demi keamanan, multi alokasi harus dari customer yang sama.
        customer_keys = {
            self._normalize_customer(bkpt.customer_name)
            for bkpt in bkpt_map.values()
            if self._normalize_customer(bkpt.customer_name)
        }

        if len(customer_keys) > 1:
            raise HTTPException(
                status_code=400,
                detail="Multi alokasi hanya boleh untuk BKPt dari customer yang sama",
            )

        if bank.customer_name:
            bank_customer_key = self._normalize_customer(bank.customer_name)

            if customer_keys and bank_customer_key not in customer_keys:
                raise HTTPException(
                    status_code=400,
                    detail="Customer Bank 103 tidak sama dengan customer BKPt yang dipilih",
                )

        # Validasi saldo dulu sebelum update data.
        for item in allocations:
            bkpt = bkpt_map[item.bkpt_receivable_id]
            amount = self._to_decimal(item.amount)
            saldo_lama = self._get_bkpt_saldo(bkpt)

            if amount <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Nominal alokasi harus lebih dari 0",
                )

            if amount > saldo_lama:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Nominal alokasi untuk invoice {bkpt.no_invoice} "
                        f"lebih besar dari saldo BKPt"
                    ),
                )

        updated_bkpts = []
        invoice_numbers = []
        customer_names = []

        for item in allocations:
            bkpt = bkpt_map[item.bkpt_receivable_id]
            amount = self._to_decimal(item.amount)

            debet = self._to_decimal(bkpt.debet)
            kredit_lama = self._to_decimal(bkpt.kredit)
            pph21 = self._to_decimal(bkpt.pph_psl_21)
            pph23 = self._to_decimal(bkpt.pph_psl_23)

            kredit_baru = kredit_lama + amount
            saldo_baru = debet - kredit_baru - pph21 - pph23

        if saldo_baru < 0:
            saldo_baru = Decimal("0")

            bkpt.kredit = kredit_baru
            bkpt.saldo = saldo_baru

            allocation_note = (
                f"Pembayaran Bank 103: {bank.keterangan or ''} "
                f"(alokasi {amount})"
            ).strip()

            if not bkpt.keterangan:
                bkpt.keterangan = allocation_note
            else:
                bkpt.keterangan = f"{bkpt.keterangan}\n{allocation_note}"

            self.repository.create_allocation(
                bank_103_id=bank.id,
                bkpt_receivable_id=bkpt.id,
                allocated_amount=amount,
            )

            if bkpt.no_invoice and bkpt.no_invoice not in invoice_numbers:
                invoice_numbers.append(bkpt.no_invoice)

            if bkpt.customer_name and bkpt.customer_name not in customer_names:
                customer_names.append(bkpt.customer_name)

            updated_bkpts.append(bkpt)

        if len(updated_bkpts) == 1:
            bank.bkpt_receivable_id = updated_bkpts[0].id
        else:
            bank.bkpt_receivable_id = None

        bank.no_invoice = ", ".join(invoice_numbers) if invoice_numbers else None

        if len(customer_names) == 1:
            bank.customer_name = customer_names[0]
        elif len(customer_names) > 1:
            bank.customer_name = "MULTI CUSTOMER"
        else:
            bank.customer_name = None

        bank.is_used = True

        self.db.commit()
        self.db.refresh(bank)

        for bkpt in updated_bkpts:
            self.db.refresh(bkpt)

        saved_allocations = self.repository.get_allocations_by_bank_id(bank.id)

        return {
            "status": "success",
            "message": "Bank 103 berhasil dialokasikan ke beberapa BKPt",
            "bank_103": bank,
            "bkpts": updated_bkpts,
            "allocations": saved_allocations,
        }
