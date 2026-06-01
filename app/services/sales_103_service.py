from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session

from app.repositories.sales_103_repository import Sales103Repository
from app.schemas.sales_103_schema import Sales103Create, Sales103Update


class Sales103Service:
    def __init__(self):
        self.repository = Sales103Repository()

    def round_money(self, value):
        """
        Semua nilai rupiah disimpan sebagai angka penuh.
        Contoh: 9999.50 menjadi 10000, 9999.49 menjadi 9999.
        """

        return Decimal(value or 0).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    def calculate_values(self, data):
        """
        Rumus fleksibel:

        DPP = JML x HARGA

        Jika PPN KELUAR diisi manual:
            pakai nilai manual

        Jika PPN KELUAR kosong:
            PPN KELUAR = (DPP x PPN RATE / 100) - PPN ADJUSTMENT

        PIUTANG DAGANG = DPP + PPN KELUAR
        """

        jml = data.jml or Decimal("0")
        harga = self.round_money(data.harga)

        dpp = data.dpp
        ppn_rate = data.ppn_rate if data.ppn_rate is not None else Decimal("11")
        ppn_adjustment = (
            data.ppn_adjustment
            if data.ppn_adjustment is not None
            else Decimal("0")
        )

        ppn_keluar = data.ppn_keluar
        piutang_dagang = data.piutang_dagang

        if dpp is None:
            dpp = jml * harga
        dpp = self.round_money(dpp)

        if ppn_keluar is None:
            ppn_keluar = (dpp * ppn_rate / Decimal("100")) - ppn_adjustment
        ppn_keluar = self.round_money(ppn_keluar)

        if piutang_dagang is None:
            piutang_dagang = dpp + ppn_keluar
        piutang_dagang = self.round_money(piutang_dagang)
        ppn_adjustment = self.round_money(ppn_adjustment)

        return harga, dpp, ppn_rate, ppn_adjustment, ppn_keluar, piutang_dagang

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def get_by_id(self, db: Session, sales_103_id: int):
        return self.repository.get_by_id(db, sales_103_id)

    def get_invoice_number(self, db: Session, current_invoice, invoice_date):
        if current_invoice and str(current_invoice).strip():
            return str(current_invoice).strip()

        return self.repository.get_next_invoice_number(db, invoice_date)

    def get_next_invoice_number(self, db: Session, invoice_date):
        return self.repository.get_next_invoice_number(db, invoice_date)

    def create(self, db: Session, data: Sales103Create):
        (
            harga,
            dpp,
            ppn_rate,
            ppn_adjustment,
            ppn_keluar,
            piutang_dagang,
        ) = self.calculate_values(data)

        payload = data.model_copy(
            update={
                "no_invoice": self.get_invoice_number(db, data.no_invoice, data.tgl),
                "harga": harga,
                "dpp": dpp,
                "ppn_rate": ppn_rate,
                "ppn_adjustment": ppn_adjustment,
                "ppn_keluar": ppn_keluar,
                "piutang_dagang": piutang_dagang,
            }
        )

        return self.repository.create(db, payload)

    def update(self, db: Session, sales_103_id: int, data: Sales103Update):
        existing_data = self.repository.get_by_id(db, sales_103_id)

        if not existing_data:
            return None

        merged_data = Sales103Update(
            tgl=data.tgl if data.tgl is not None else existing_data.tgl,
            no_ord=data.no_ord if data.no_ord is not None else existing_data.no_ord,
            no_invoice=(
                data.no_invoice
                if data.no_invoice is not None
                else existing_data.no_invoice
            ),
            no_faktur=(
                data.no_faktur
                if data.no_faktur is not None
                else existing_data.no_faktur
            ),
            langganan=(
                data.langganan
                if data.langganan is not None
                else existing_data.langganan
            ),
            jenis_cetak=(
                data.jenis_cetak
                if data.jenis_cetak is not None
                else existing_data.jenis_cetak
            ),
            jml=data.jml if data.jml is not None else existing_data.jml,
            sat=data.sat if data.sat is not None else existing_data.sat,
            harga=data.harga if data.harga is not None else existing_data.harga,

            # DPP dan PPN KELUAR sengaja pakai data baru.
            # Kalau kosong, akan dihitung ulang otomatis.
            dpp=data.dpp,
            ppn_rate=(
                data.ppn_rate
                if data.ppn_rate is not None
                else existing_data.ppn_rate
            ),
            ppn_adjustment=(
                data.ppn_adjustment
                if data.ppn_adjustment is not None
                else existing_data.ppn_adjustment
            ),
            ppn_keluar=data.ppn_keluar,
            piutang_dagang=data.piutang_dagang,

            production_order_id=(
                data.production_order_id
                if data.production_order_id is not None
                else existing_data.production_order_id
            ),
            keterangan=(
                data.keterangan
                if data.keterangan is not None
                else existing_data.keterangan
            ),
        )

        (
            harga,
            dpp,
            ppn_rate,
            ppn_adjustment,
            ppn_keluar,
            piutang_dagang,
        ) = self.calculate_values(merged_data)

        payload = Sales103Update(
            tgl=merged_data.tgl,
            no_ord=merged_data.no_ord,
            no_invoice=self.get_invoice_number(
                db,
                merged_data.no_invoice,
                merged_data.tgl,
            ),
            no_faktur=merged_data.no_faktur,
            langganan=merged_data.langganan,
            jenis_cetak=merged_data.jenis_cetak,
            jml=merged_data.jml,
            sat=merged_data.sat,
            harga=harga,
            dpp=dpp,
            ppn_rate=ppn_rate,
            ppn_adjustment=ppn_adjustment,
            ppn_keluar=ppn_keluar,
            piutang_dagang=piutang_dagang,
            production_order_id=merged_data.production_order_id,
            keterangan=merged_data.keterangan,
        )

        return self.repository.update(db, sales_103_id, payload)

    def delete(self, db: Session, sales_103_id: int):
        return self.repository.delete(db, sales_103_id)
