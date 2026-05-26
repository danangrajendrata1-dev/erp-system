from typing import List
from urllib.parse import unquote

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.sales_103_schema import (
    Sales103Create,
    Sales103Update,
    Sales103Response,
)
from app.services.sales_103_service import Sales103Service


router = APIRouter(
    prefix="/sales-103",
    tags=["Sales 103"],
)

service = Sales103Service()


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


@router.get("/", response_model=List[Sales103Response])
def get_all_sales_103(db: Session = Depends(get_db)):
    return service.get_all(db)


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
            grouped[no_invoice] = {
                "no_invoice": no_invoice,
                "tgl": get_value(row, "tgl", "date"),
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


@router.get("/invoice/{no_invoice}", response_model=List[Sales103Response])
def get_sales_103_by_invoice(
    no_invoice: str,
    db: Session = Depends(get_db),
):
    decoded_invoice = unquote(no_invoice).strip()

    rows = service.get_all(db)

    filtered_rows = [
        row
        for row in rows
        if str(get_value(row, "no_invoice", "invoice_number") or "")
        .strip()
        .lower()
        == decoded_invoice.lower()
    ]

    if not filtered_rows:
        raise HTTPException(
            status_code=404,
            detail=f"Invoice {decoded_invoice} tidak ditemukan",
        )

    return filtered_rows


@router.get("/{sales_103_id}", response_model=Sales103Response)
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


@router.put("/{sales_103_id}", response_model=Sales103Response)
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


@router.delete("/{sales_103_id}")
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