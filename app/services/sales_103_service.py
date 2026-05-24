from decimal import Decimal
from sqlalchemy.orm import Session

from app.repositories.sales_103_repository import Sales103Repository
from app.schemas.sales_103_schema import Sales103Create, Sales103Update


class Sales103Service:
    def __init__(self):
        self.repository = Sales103Repository()

    def calculate_values(self, data):
        """
        Rumus mengikuti sheet Excel 103:

        DPP = JML x HARGA
        PPN KELUAR = DPP x 11%
        PIUTANG DAGANG = DPP + PPN KELUAR

        Catatan:
        Kalau dpp / ppn_keluar / piutang_dagang diisi manual,
        maka nilai manual tetap dipakai.
        """

        jml = data.jml or Decimal("0")
        harga = data.harga or Decimal("0")

        dpp = data.dpp
        ppn_keluar = data.ppn_keluar
        piutang_dagang = data.piutang_dagang

        if dpp is None:
            dpp = jml * harga

        if ppn_keluar is None:
            ppn_keluar = dpp * Decimal("0.11")

        if piutang_dagang is None:
            piutang_dagang = dpp + ppn_keluar

        return dpp, ppn_keluar, piutang_dagang

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def get_by_id(self, db: Session, sales_103_id: int):
        return self.repository.get_by_id(db, sales_103_id)

    def create(self, db: Session, data: Sales103Create):
        dpp, ppn_keluar, piutang_dagang = self.calculate_values(data)

        payload = data.model_copy(
            update={
                "dpp": dpp,
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
            no_invoice=data.no_invoice if data.no_invoice is not None else existing_data.no_invoice,
            no_faktur=data.no_faktur if data.no_faktur is not None else existing_data.no_faktur,
            langganan=data.langganan if data.langganan is not None else existing_data.langganan,
            jenis_cetak=data.jenis_cetak if data.jenis_cetak is not None else existing_data.jenis_cetak,
            jml=data.jml if data.jml is not None else existing_data.jml,
            sat=data.sat if data.sat is not None else existing_data.sat,
            harga=data.harga if data.harga is not None else existing_data.harga,
            dpp=data.dpp,
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

        dpp, ppn_keluar, piutang_dagang = self.calculate_values(merged_data)

        payload = data.model_copy(
            update={
                "dpp": dpp,
                "ppn_keluar": ppn_keluar,
                "piutang_dagang": piutang_dagang,
            }
        )

        return self.repository.update(db, sales_103_id, payload)

    def delete(self, db: Session, sales_103_id: int):
        return self.repository.delete(db, sales_103_id)