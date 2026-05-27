import re

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.sales_103_model import Sales103
from app.models.bkorder_model import BKOrder
from app.schemas.sales_103_schema import Sales103Create, Sales103Update


class Sales103Repository:
    def _normalize_order_number(self, value):
        return str(value or "").strip().lower()

    def _split_invoice_number(self, value):
        text = str(value or "").strip().upper()
        match = re.match(r"^([A-Z]+)\.(\d+)$", text)

        if not match:
            return None, None

        return match.group(1), int(match.group(2))

    def get_next_invoice_number(self, db: Session):
        """
        Membuat nomor Invoice 103 berikutnya saat user belum mengisi NO. INVOICE.
        Format mengikuti data lama, contoh: LOI.0001, LOI.0002, dan seterusnya.
        """

        invoice_rows = (
            db.query(Sales103.no_invoice)
            .filter(Sales103.no_invoice.isnot(None))
            .all()
        )

        latest_invoice = (
            db.query(Sales103.no_invoice)
            .filter(Sales103.no_invoice.isnot(None))
            .filter(func.trim(Sales103.no_invoice) != "")
            .order_by(Sales103.id.desc())
            .first()
        )

        prefix = "LOI"

        if latest_invoice:
            latest_prefix, _ = self._split_invoice_number(latest_invoice[0])

            if latest_prefix:
                prefix = latest_prefix

        max_number = 0

        for row in invoice_rows:
            row_prefix, row_number = self._split_invoice_number(row[0])

            if row_prefix == prefix and row_number is not None:
                max_number = max(max_number, row_number)

        return f"{prefix}.{max_number + 1:04d}"

    def _attach_bkorder_fields(self, sales_103: Sales103, bkorder: BKOrder | None):
        """
        Menempelkan data BKOrder ke object Sales103 untuk response API.
        Tidak mengubah tabel dan tidak menambah kolom database.
        Dipakai khusus agar Invoice 103 bisa menampilkan:
        - PO Date dari BKOrder
        - DO Number dari BKOrder
        """

        if not sales_103:
            return sales_103

        if bkorder:
            sales_103.bkorder_order_date = bkorder.order_date
            sales_103.bkorder_order_number = bkorder.order_number
            sales_103.bkorder_po_date = bkorder.po_date
            sales_103.bkorder_do_number = bkorder.do_number
            sales_103.bkorder_delivery_date = bkorder.delivery_date
            sales_103.bkorder_customer_name = bkorder.customer_name

            # Alias supaya frontend bisa langsung membaca field umum.
            sales_103.po_date = bkorder.po_date
            sales_103.do_number = bkorder.do_number
            sales_103.order_number = bkorder.order_number
            sales_103.delivery_date = bkorder.delivery_date
        else:
            sales_103.bkorder_order_date = None
            sales_103.bkorder_order_number = None
            sales_103.bkorder_po_date = None
            sales_103.bkorder_do_number = None
            sales_103.bkorder_delivery_date = None
            sales_103.bkorder_customer_name = None

            sales_103.po_date = None
            sales_103.do_number = None
            sales_103.order_number = None
            sales_103.delivery_date = None

        return sales_103

    def get_all(self, db: Session):
        rows = db.query(Sales103).order_by(Sales103.id.asc()).all()

        production_order_ids = {
            row.production_order_id
            for row in rows
            if row.production_order_id is not None
        }
        order_numbers = {
            self._normalize_order_number(row.no_ord)
            for row in rows
            if self._normalize_order_number(row.no_ord)
        }

        bkorders_by_id = {}
        bkorders_by_order_number = {}

        if production_order_ids:
            bkorders_by_id = {
                item.id: item
                for item in db.query(BKOrder)
                .filter(BKOrder.id.in_(production_order_ids))
                .all()
            }

        if order_numbers:
            bkorders = (
                db.query(BKOrder)
                .filter(func.lower(func.trim(BKOrder.order_number)).in_(order_numbers))
                .order_by(BKOrder.id.asc())
                .all()
            )

            for bkorder in bkorders:
                key = self._normalize_order_number(bkorder.order_number)

                if key and key not in bkorders_by_order_number:
                    bkorders_by_order_number[key] = bkorder

        result = []

        for sales_103 in rows:
            bkorder = None

            if sales_103.production_order_id is not None:
                bkorder = bkorders_by_id.get(sales_103.production_order_id)

            # Fallback aman untuk data lama: no_ord Sales 103 dicocokkan ke order_number BKOrder.
            if not bkorder:
                bkorder = bkorders_by_order_number.get(
                    self._normalize_order_number(sales_103.no_ord)
                )

            result.append(self._attach_bkorder_fields(sales_103, bkorder))

        return result

    def get_by_id(self, db: Session, sales_103_id: int):
        sales_103 = (
            db.query(Sales103)
            .filter(Sales103.id == sales_103_id)
            .first()
        )

        if not sales_103:
            return None

        bkorder = None

        if sales_103.production_order_id is not None:
            bkorder = (
                db.query(BKOrder)
                .filter(BKOrder.id == sales_103.production_order_id)
                .first()
            )

        # Fallback aman untuk row Sales 103 lama yang belum punya production_order_id.
        if not bkorder and sales_103.no_ord:
            bkorder = (
                db.query(BKOrder)
                .filter(
                    func.lower(func.trim(BKOrder.order_number))
                    == self._normalize_order_number(sales_103.no_ord)
                )
                .order_by(BKOrder.id.asc())
                .first()
            )

        return self._attach_bkorder_fields(sales_103, bkorder)

    def create(self, db: Session, data: Sales103Create):
        new_sales_103 = Sales103(**data.model_dump())

        db.add(new_sales_103)
        db.commit()
        db.refresh(new_sales_103)

        return self.get_by_id(db, new_sales_103.id)

    def update(self, db: Session, sales_103_id: int, data: Sales103Update):
        sales_103 = (
            db.query(Sales103)
            .filter(Sales103.id == sales_103_id)
            .first()
        )

        if not sales_103:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(sales_103, field, value)

        db.commit()
        db.refresh(sales_103)

        return self.get_by_id(db, sales_103.id)

    def delete(self, db: Session, sales_103_id: int):
        sales_103 = (
            db.query(Sales103)
            .filter(Sales103.id == sales_103_id)
            .first()
        )

        if not sales_103:
            return None

        db.delete(sales_103)
        db.commit()

        return sales_103
