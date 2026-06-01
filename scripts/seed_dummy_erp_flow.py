from __future__ import annotations

import sys
from datetime import date
from decimal import Decimal
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database.connection import SessionLocal  # noqa: E402
from app.models.bank_103_model import Bank103  # noqa: E402
from app.models.bkorder_model import BKOrder  # noqa: E402
from app.models.bkpt_receivables_model import BKPtReceivable  # noqa: E402
from app.models.customer_model import Customer  # noqa: E402
from app.models.sales_103_model import Sales103  # noqa: E402


DUMMY_CUSTOMER_NAME = "PT DUMMY FLOW TEST"
DUMMY_CUSTOMER_ADDRESS = "Jl. Dummy ERP No. 1"

DUMMY_BKORDERS = [
    {
        "order_date": date(2026, 1, 5),
        "order_number": "DUMMY-ORD-202601-001",
        "po_date": date(2026, 1, 5),
        "delivery_date": date(2026, 1, 10),
        "customer_name": DUMMY_CUSTOMER_NAME,
        "unit": "Rim",
        "quantity": Decimal("100"),
        "rim": Decimal("100"),
        "price": Decimal("25000"),
        "print_type": "Ambri",
        "do_number": "DUMMY-DO-202601-001",
    },
    {
        "order_date": date(2026, 2, 5),
        "order_number": "DUMMY-ORD-202602-001",
        "po_date": date(2026, 2, 5),
        "delivery_date": date(2026, 2, 10),
        "customer_name": DUMMY_CUSTOMER_NAME,
        "unit": "Rim",
        "quantity": Decimal("200"),
        "rim": Decimal("200"),
        "price": Decimal("25000"),
        "print_type": "Ambri",
        "do_number": "DUMMY-DO-202602-001",
    },
]

DUMMY_SALES = [
    {
        "tgl": date(2026, 1, 10),
        "no_ord": "DUMMY-ORD-202601-001",
        "no_invoice": "LOI.0001",
        "no_faktur": "DUMMY-FKT-202601-001",
        "langganan": DUMMY_CUSTOMER_NAME,
        "jenis_cetak": "Ambri",
        "jml": Decimal("50"),
        "sat": "Rim",
        "harga": Decimal("25000"),
        "dpp": Decimal("1250000"),
        "ppn_rate": Decimal("11"),
        "ppn_adjustment": Decimal("0"),
        "ppn_keluar": Decimal("137500"),
        "piutang_dagang": Decimal("1387500"),
        "production_order_id": None,
        "keterangan": "DUMMY SALES FLOW JAN ROW 1",
    },
    {
        "tgl": date(2026, 1, 10),
        "no_ord": "DUMMY-ORD-202601-001",
        "no_invoice": "LOI.0001",
        "no_faktur": "DUMMY-FKT-202601-002",
        "langganan": DUMMY_CUSTOMER_NAME,
        "jenis_cetak": "Ambri",
        "jml": Decimal("50"),
        "sat": "Rim",
        "harga": Decimal("25000"),
        "dpp": Decimal("1250000"),
        "ppn_rate": Decimal("11"),
        "ppn_adjustment": Decimal("0"),
        "ppn_keluar": Decimal("137500"),
        "piutang_dagang": Decimal("1387500"),
        "production_order_id": None,
        "keterangan": "DUMMY SALES FLOW JAN ROW 2",
    },
    {
        "tgl": date(2026, 2, 10),
        "no_ord": "DUMMY-ORD-202602-001",
        "no_invoice": "LOI.0001",
        "no_faktur": "DUMMY-FKT-202602-001",
        "langganan": DUMMY_CUSTOMER_NAME,
        "jenis_cetak": "Ambri",
        "jml": Decimal("200"),
        "sat": "Rim",
        "harga": Decimal("25000"),
        "dpp": Decimal("5000000"),
        "ppn_rate": Decimal("11"),
        "ppn_adjustment": Decimal("0"),
        "ppn_keluar": Decimal("550000"),
        "piutang_dagang": Decimal("5550000"),
        "production_order_id": None,
        "keterangan": "DUMMY SALES FLOW FEB ROW 1",
    },
]

DUMMY_BKPTS = [
    {
        "customer_name": DUMMY_CUSTOMER_NAME,
        "tgl": date(2026, 1, 10),
        "invoice_year": 2026,
        "invoice_month": 1,
        "no_order": "DUMMY-ORD-202601-001",
        "no_invoice": "LOI.0001",
        "faktur": "DUMMY-FKT-202601-001",
        "pr": DUMMY_CUSTOMER_NAME,
        "debet": Decimal("2775000"),
        "kredit": Decimal("0"),
        "pph_psl_21": Decimal("0"),
        "pph_psl_23": Decimal("0"),
        "saldo": Decimal("2775000"),
        "keterangan": "DUMMY BKPT JAN 2026",
        "sales_103_id": None,
    },
    {
        "customer_name": DUMMY_CUSTOMER_NAME,
        "tgl": date(2026, 2, 10),
        "invoice_year": 2026,
        "invoice_month": 2,
        "no_order": "DUMMY-ORD-202602-001",
        "no_invoice": "LOI.0001",
        "faktur": "DUMMY-FKT-202602-001",
        "pr": DUMMY_CUSTOMER_NAME,
        "debet": Decimal("5550000"),
        "kredit": Decimal("0"),
        "pph_psl_21": Decimal("0"),
        "pph_psl_23": Decimal("0"),
        "saldo": Decimal("5550000"),
        "keterangan": "DUMMY BKPT FEB 2026",
        "sales_103_id": None,
    },
]

DUMMY_BANKS = [
    {
        "tgl": date(2026, 1, 12),
        "kode": "BkPt",
        "keterangan": "DUMMY BANK JAN 2026 LOI.0001",
        "debet": Decimal("2775000"),
        "kredit": Decimal("0"),
        "saldo": Decimal("2775000"),
        "bkpt_receivable_id": None,
        "no_invoice": "LOI.0001",
        "customer_name": DUMMY_CUSTOMER_NAME,
        "is_used": False,
    },
    {
        "tgl": date(2026, 2, 12),
        "kode": "BkPt",
        "keterangan": "DUMMY BANK FEB 2026 LOI.0001",
        "debet": Decimal("5550000"),
        "kredit": Decimal("0"),
        "saldo": Decimal("5550000"),
        "bkpt_receivable_id": None,
        "no_invoice": "LOI.0001",
        "customer_name": DUMMY_CUSTOMER_NAME,
        "is_used": False,
    },
]


def _seed_customer(db):
    customer = (
        db.query(Customer)
        .filter(Customer.name == DUMMY_CUSTOMER_NAME)
        .first()
    )

    if not customer:
        customer = Customer(name=DUMMY_CUSTOMER_NAME)
        db.add(customer)

    customer.phone = None
    customer.address = DUMMY_CUSTOMER_ADDRESS
    customer.company = DUMMY_CUSTOMER_NAME

    return customer


def _seed_bkorder(db, payload: dict):
    item = (
        db.query(BKOrder)
        .filter(BKOrder.order_number == payload["order_number"])
        .first()
    )

    if not item:
        item = BKOrder()
        db.add(item)

    for key, value in payload.items():
        setattr(item, key, value)

    return item


def _seed_sales_row(db, payload: dict):
    item = (
        db.query(Sales103)
        .filter(Sales103.no_invoice == payload["no_invoice"])
        .filter(Sales103.tgl == payload["tgl"])
        .filter(Sales103.no_ord == payload["no_ord"])
        .filter(Sales103.no_faktur == payload["no_faktur"])
        .filter(Sales103.langganan == payload["langganan"])
        .filter(Sales103.jenis_cetak == payload["jenis_cetak"])
        .filter(Sales103.jml == payload["jml"])
        .filter(Sales103.sat == payload["sat"])
        .filter(Sales103.harga == payload["harga"])
        .filter(Sales103.dpp == payload["dpp"])
        .filter(Sales103.ppn_keluar == payload["ppn_keluar"])
        .filter(Sales103.piutang_dagang == payload["piutang_dagang"])
        .filter(Sales103.keterangan == payload["keterangan"])
        .first()
    )

    if not item:
        item = Sales103()
        db.add(item)

    for key, value in payload.items():
        setattr(item, key, value)

    return item


def _seed_bkpt(db, payload: dict):
    item = (
        db.query(BKPtReceivable)
        .filter(BKPtReceivable.customer_name == payload["customer_name"])
        .filter(BKPtReceivable.tgl == payload["tgl"])
        .filter(BKPtReceivable.invoice_year == payload["invoice_year"])
        .filter(BKPtReceivable.invoice_month == payload["invoice_month"])
        .filter(BKPtReceivable.no_order == payload["no_order"])
        .filter(BKPtReceivable.no_invoice == payload["no_invoice"])
        .filter(BKPtReceivable.faktur == payload["faktur"])
        .filter(BKPtReceivable.debet == payload["debet"])
        .filter(BKPtReceivable.keterangan == payload["keterangan"])
        .first()
    )

    if not item:
        item = BKPtReceivable()
        db.add(item)

    for key, value in payload.items():
        setattr(item, key, value)

    return item


def _seed_bank(db, payload: dict):
    item = (
        db.query(Bank103)
        .filter(Bank103.kode == payload["kode"])
        .filter(Bank103.tgl == payload["tgl"])
        .filter(Bank103.no_invoice == payload["no_invoice"])
        .filter(Bank103.customer_name == payload["customer_name"])
        .filter(Bank103.keterangan == payload["keterangan"])
        .first()
    )

    if not item:
        item = Bank103()
        db.add(item)

    for key, value in payload.items():
        setattr(item, key, value)

    return item


def seed():
    db = SessionLocal()

    try:
        _seed_customer(db)

        for payload in DUMMY_BKORDERS:
            _seed_bkorder(db, payload)

        for payload in DUMMY_SALES:
            _seed_sales_row(db, payload)

        for payload in DUMMY_BKPTS:
            _seed_bkpt(db, payload)

        for payload in DUMMY_BANKS:
            _seed_bank(db, payload)

        db.commit()
        print("Seed dummy ERP flow selesai.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def cleanup():
    db = SessionLocal()

    try:
        bank_rows = (
            db.query(Bank103)
            .filter(Bank103.no_invoice.ilike("%DUMMY%"))
            .all()
        )
        for row in bank_rows:
            db.delete(row)

        bkpt_rows = (
            db.query(BKPtReceivable)
            .filter(BKPtReceivable.customer_name == DUMMY_CUSTOMER_NAME)
            .all()
        )
        for row in bkpt_rows:
            db.delete(row)

        sales_rows = (
            db.query(Sales103)
            .filter(Sales103.no_ord.ilike("DUMMY-%"))
            .all()
        )
        for row in sales_rows:
            db.delete(row)

        bkorders = (
            db.query(BKOrder)
            .filter(BKOrder.order_number.ilike("DUMMY-%"))
            .all()
        )
        for row in bkorders:
            db.delete(row)

        customers = (
            db.query(Customer)
            .filter(Customer.name == DUMMY_CUSTOMER_NAME)
            .all()
        )
        for row in customers:
            db.delete(row)

        db.commit()
        print("Cleanup dummy ERP flow selesai.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in {"seed", "cleanup"}:
        print("Usage: python scripts/seed_dummy_erp_flow.py [seed|cleanup]")
        raise SystemExit(1)

    if sys.argv[1] == "seed":
        seed()
        return

    cleanup()


if __name__ == "__main__":
    main()
