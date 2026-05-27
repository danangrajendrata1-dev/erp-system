from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.bkorder_repository import BKOrderRepository
from app.schemas.bkorder_schema import BKOrderCreate, BKOrderUpdate

EXCEL_REPEAT_COLUMNS = 14


def _normalize_dates(values: Optional[List[Optional[str]]]) -> List[Optional[str]]:
    values = values or []
    normalized = list(values[:EXCEL_REPEAT_COLUMNS])
    while len(normalized) < EXCEL_REPEAT_COLUMNS:
        normalized.append(None)
    return normalized


def _normalize_numbers(values: Optional[List[Optional[float]]]) -> List[float]:
    values = values or []
    normalized: List[float] = []
    for value in values[:EXCEL_REPEAT_COLUMNS]:
        try:
            normalized.append(float(value or 0))
        except (TypeError, ValueError):
            normalized.append(0)
    while len(normalized) < EXCEL_REPEAT_COLUMNS:
        normalized.append(0)
    return normalized


def _auto_total_keping(values: List[float]) -> Decimal:
    return Decimal(str(sum(values)))


def _round_money(value) -> Decimal:
    return Decimal(value or 0).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


class BKOrderService:
    def __init__(self, db: Session):
        self.repository = BKOrderRepository(db)

    def _prepare_create(self, data: BKOrderCreate) -> BKOrderCreate:
        payload = data.model_dump()
        payload["delivery_completed_dates"] = _normalize_dates(payload.get("delivery_completed_dates"))
        payload["partial_billing_quantities"] = _normalize_numbers(payload.get("partial_billing_quantities"))

        if payload.get("total_keping") in (None, 0, Decimal("0"), ""):
            payload["total_keping"] = _auto_total_keping(payload["partial_billing_quantities"])

        if "price" in payload:
            payload["price"] = _round_money(payload.get("price"))

        return BKOrderCreate(**payload)

    def _prepare_update(self, data: BKOrderUpdate) -> BKOrderUpdate:
        payload = data.model_dump(exclude_unset=True)

        if "delivery_completed_dates" in payload:
            payload["delivery_completed_dates"] = _normalize_dates(payload.get("delivery_completed_dates"))

        if "partial_billing_quantities" in payload:
            payload["partial_billing_quantities"] = _normalize_numbers(payload.get("partial_billing_quantities"))
            if payload.get("total_keping") in (None, 0, Decimal("0"), ""):
                payload["total_keping"] = _auto_total_keping(payload["partial_billing_quantities"])

        if "price" in payload:
            payload["price"] = _round_money(payload.get("price"))

        return BKOrderUpdate(**payload)

    def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
    ):
        return self.repository.get_all(search=search, status=status, month=month, year=year)

    def get_by_id(self, bkorder_id: int):
        obj = self.repository.get_by_id(bkorder_id)
        if not obj:
            raise HTTPException(status_code=404, detail="BKOrder tidak ditemukan")
        return obj

    def create(self, data: BKOrderCreate):
        return self.repository.create(self._prepare_create(data))

    def update(self, bkorder_id: int, data: BKOrderUpdate):
        obj = self.repository.update(bkorder_id, self._prepare_update(data))
        if not obj:
            raise HTTPException(status_code=404, detail="BKOrder tidak ditemukan")
        return obj

    def delete(self, bkorder_id: int):
        obj = self.repository.delete(bkorder_id)
        if not obj:
            raise HTTPException(status_code=404, detail="BKOrder tidak ditemukan")
        return {"message": "BKOrder berhasil dihapus"}

    def timeline(self, bkorder_id: int):
        obj = self.get_by_id(bkorder_id)
        kirim_dates = obj.delivery_completed_dates or []
        kirim_dates = [value for value in kirim_dates if value]

        timeline = [
            {"label": "TGL", "date": obj.order_date, "description": "Tanggal order masuk"},
            {"label": "PO Date", "date": obj.po_date, "description": "Tanggal PO"},
            {"label": "Deliv. Date", "date": obj.delivery_date, "description": "Tanggal rencana delivery"},
        ]

        for index, value in enumerate(kirim_dates, start=1):
            timeline.append(
                {
                    "label": f"TGL KIRIM / SELESAI {index}",
                    "date": value,
                    "description": "Tanggal kirim / selesai sesuai kolom Excel",
                }
            )

        return timeline
