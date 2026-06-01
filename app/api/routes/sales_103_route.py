from datetime import date
from typing import List
from urllib.parse import unquote
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.bkpt_receivables_schema import (
    BKPtReceivableCreate,
    BKPtReceivableResponse,
)
from app.schemas.sales_103_schema import (
    Sales103Create,
    Sales103Update,
    Sales103Response,
)
from app.services.bkpt_receivables_service import BKPtReceivableService
from app.services.sales_103_service import Sales103Service


router = APIRouter(
    prefix="/sales-103",
    tags=["Sales 103"],
)

service = Sales103Service()
bkpt_service = BKPtReceivableService()


def to_number(value):
    if value is None or value == "":
        return 0

    try:
        return float(value)
    except (TypeError, ValueError):
        return 0


def get_value(row, *fields):
    for field in fields:
        value = getattr(row, field, None)
        if value is not None and value != "":
            return value
    return None


def get_dpp(row):
    dpp = to_number(get_value(row, "dpp", "amount"))

    if dpp > 0:
        return dpp

    qty = to_number(get_value(row, "jml", "quantity"))
    harga = to_number(get_value(row, "harga", "price"))

    return qty * harga


def get_ppn(row):
    ppn = to_number(get_value(row, "ppn_keluar", "vat"))

    if ppn > 0:
        return ppn

    return round(get_dpp(row) * 0.11)


def get_piutang(row):
    piutang = to_number(
        get_value(row, "piutang_dagang", "total", "grand_total")
    )

    if piutang > 0:
        return piutang

    return get_dpp(row) + get_ppn(row)


def to_decimal_money(value):
    return Decimal(str(value or 0)).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP,
    )


def get_rows_by_invoice(rows, no_invoice: str):
    return [
        row
        for row in rows
        if str(get_value(row, "no_invoice", "invoice_number") or "")
        .strip()
        .lower()
        == no_invoice.lower()
    ]


def get_rows_by_invoice_period(rows, no_invoice: str, year: int, month: int):
    filtered_rows = []

    for row in rows:
        row_invoice = str(
            get_value(row, "no_invoice", "invoice_number") or ""
        ).strip().lower()
        row_date = get_value(row, "tgl", "date")

        if row_invoice != no_invoice.lower() or not row_date:
            continue

        if row_date.year == year and row_date.month == month:
            filtered_rows.append(row)

    return filtered_rows


def unique_join(rows, *fields):
    values = []

    for row in rows:
        value = get_value(row, *fields)

        if not value:
            continue

        text = str(value).strip()

        if text and text not in values:
            values.append(text)

    return ", ".join(values)


@router.get("/", response_model=List[Sales103Response])
def get_all_sales_103(db: Session = Depends(get_db)):
    return service.get_all(db)


@router.get("/invoices/next-number")
def get_next_invoice_number(
    tgl: date,
    db: Session = Depends(get_db),
):
    return {
        "next_invoice": service.get_next_invoice_number(db, tgl),
    }


@router.get("/invoices")
def get_invoice_103_groups(db: Session = Depends(get_db)):
    rows = service.get_all(db)

    grouped = {}

    for row in rows:
        no_invoice = get_value(row, "no_invoice", "invoice_number")

        if not no_invoice:
            continue

        no_invoice = str(no_invoice).strip()

        if no_invoice not in grouped:
            invoice_date = get_value(row, "tgl", "date")
            grouped[no_invoice] = {
                "no_invoice": no_invoice,
                "tgl": invoice_date,
                "year": invoice_date.year if invoice_date else None,
                "month": invoice_date.month if invoice_date else None,
                "langganan": get_value(
                    row,
                    "langganan",
                    "pelanggan",
                    "customer",
                    "customer_name",
                ),
                "alamat": get_value(
                    row,
                    "alamat",
                    "address",
                    "ship_to_address",
                ),
                "total_items": 0,
                "po_numbers": [],
                "do_numbers": [],
                "subtotal": 0,
                "ppn_keluar": 0,
                "piutang_dagang": 0,
            }

        po_number = get_value(
            row,
            "po_number",
            "po_no",
            "po",
            "no_ord",
            "no_order",
        )

        do_number = get_value(
            row,
            "do_number",
            "do_no",
        )

        if po_number and po_number not in grouped[no_invoice]["po_numbers"]:
            grouped[no_invoice]["po_numbers"].append(po_number)

        if do_number and do_number not in grouped[no_invoice]["do_numbers"]:
            grouped[no_invoice]["do_numbers"].append(do_number)

        grouped[no_invoice]["total_items"] += 1
        grouped[no_invoice]["subtotal"] += get_dpp(row)
        grouped[no_invoice]["ppn_keluar"] += get_ppn(row)
        grouped[no_invoice]["piutang_dagang"] += get_piutang(row)

    data = list(grouped.values())

    data.sort(
        key=lambda item: str(item.get("tgl") or ""),
        reverse=True,
    )

    return {
        "status": "success",
        "message": "Daftar invoice 103 berhasil diambil",
        "data": data,
    }


@router.get("/invoice/{year}/{month}/{no_invoice}", response_model=List[Sales103Response])
def get_sales_103_by_invoice_period(
    year: int,
    month: int,
    no_invoice: str,
    db: Session = Depends(get_db),
):
    decoded_invoice = unquote(no_invoice).strip()

    rows = service.get_all(db)
    filtered_rows = get_rows_by_invoice_period(rows, decoded_invoice, year, month)

    if not filtered_rows:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Invoice {decoded_invoice} periode {year}-{month:02d} tidak ditemukan"
            ),
        )

    return filtered_rows


@router.get("/invoice/{no_invoice}", response_model=List[Sales103Response])
def get_sales_103_by_invoice(
    no_invoice: str,
    db: Session = Depends(get_db),
):
    decoded_invoice = unquote(no_invoice).strip()

    rows = service.get_all(db)
    filtered_rows = get_rows_by_invoice(rows, decoded_invoice)

    if not filtered_rows:
        raise HTTPException(
            status_code=404,
            detail=f"Invoice {decoded_invoice} tidak ditemukan",
        )

    return filtered_rows
@router.post(
    "/finalize-bkpt",
    response_model=BKPtReceivableResponse,
)
def finalize_invoice_103_to_bkpt(
    no_invoice: str,
    year: int | None = None,
    month: int | None = None,
    db: Session = Depends(get_db),
):
    decoded_invoice = unquote(no_invoice).strip()
    all_rows = service.get_all(db)
    rows = (
        get_rows_by_invoice_period(all_rows, decoded_invoice, year, month)
        if year is not None and month is not None
        else get_rows_by_invoice(all_rows, decoded_invoice)
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Invoice {decoded_invoice} periode {year}-{month:02d} tidak ditemukan"
                if year is not None and month is not None
                else f"Invoice {decoded_invoice} tidak ditemukan"
            ),
        )

    first_row = rows[0]
    invoice_date = get_value(first_row, "tgl", "date")
    invoice_year = year if year is not None else getattr(invoice_date, "year", None)
    invoice_month = month if month is not None else getattr(invoice_date, "month", None)

    existing_items = bkpt_service.get_all(
        db,
        no_invoice=decoded_invoice,
        invoice_year=invoice_year,
        invoice_month=invoice_month,
    )
    exact_existing_items = [
        item
        for item in existing_items
        if (
            str(item.no_invoice or "").strip().lower() == decoded_invoice.lower()
            and item.invoice_year == invoice_year
            and item.invoice_month == invoice_month
        )
    ]

    if exact_existing_items:
        raise HTTPException(
            status_code=400,
            detail="Invoice ini sudah difinalisasi ke BKPt untuk periode tersebut.",
        )

    total_piutang = sum(get_piutang(row) for row in rows)

    if total_piutang <= 0:
        raise HTTPException(
            status_code=400,
            detail="Total piutang Invoice 103 harus lebih dari 0",
        )

    customer_name = str(
        get_value(
            first_row,
            "langganan",
            "pelanggan",
            "customer",
            "customer_name",
        )
        or ""
    ).strip()

    if not customer_name:
        raise HTTPException(
            status_code=400,
            detail="Langganan Invoice 103 belum terisi",
        )

    total_piutang_decimal = to_decimal_money(total_piutang)

    # Finalisasi ini membuat satu baris BKPt per nomor invoice, bukan per item 103.
    payload = BKPtReceivableCreate(
        customer_name=customer_name,
        tgl=get_value(first_row, "tgl", "date"),
        invoice_year=invoice_year,
        invoice_month=invoice_month,
        no_order=unique_join(rows, "no_ord", "no_order", "po_number", "po_no"),
        no_invoice=decoded_invoice,
        faktur=unique_join(rows, "no_faktur", "faktur"),
        pr=customer_name,
        debet=total_piutang_decimal,
        kredit=Decimal("0"),
        pph_psl_21=Decimal("0"),
        pph_psl_23=Decimal("0"),
        saldo=total_piutang_decimal,
        keterangan=f"Piutang dari Invoice 103 {decoded_invoice}",
        sales_103_id=getattr(first_row, "id", None),
    )

    return bkpt_service.create(db, payload)


@router.get("/{sales_103_id:int}", response_model=Sales103Response)
def get_sales_103_by_id(
    sales_103_id: int,
    db: Session = Depends(get_db),
):
    data = service.get_by_id(db, sales_103_id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data sales 103 tidak ditemukan",
        )

    return data


@router.post("/", response_model=Sales103Response)
def create_sales_103(
    payload: Sales103Create,
    db: Session = Depends(get_db),
):
    return service.create(db, payload)


@router.put("/{sales_103_id:int}", response_model=Sales103Response)
def update_sales_103(
    sales_103_id: int,
    payload: Sales103Update,
    db: Session = Depends(get_db),
):
    data = service.update(db, sales_103_id, payload)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data sales 103 tidak ditemukan",
        )

    return data


@router.delete("/{sales_103_id:int}")
def delete_sales_103(
    sales_103_id: int,
    db: Session = Depends(get_db),
):
    data = service.delete(db, sales_103_id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data sales 103 tidak ditemukan",
        )

    return {
        "message": "Data sales 103 berhasil dihapus"
    }
