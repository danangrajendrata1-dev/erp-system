from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.production_repository import ProductionOrderRepository
from app.schemas.production_schema import ProductionOrderCreate, ProductionOrderUpdate

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


class ProductionOrderService:
    def __init__(self, db: Session):
        self.repository = ProductionOrderRepository(db)

    def _prepare_create(self, data: ProductionOrderCreate) -> ProductionOrderCreate:
        payload = data.model_dump()
        payload["delivery_completed_dates"] = _normalize_dates(payload.get("delivery_completed_dates"))
        payload["partial_billing_quantities"] = _normalize_numbers(payload.get("partial_billing_quantities"))

        if payload.get("total_keping") in (None, 0, Decimal("0"), ""):
            payload["total_keping"] = _auto_total_keping(payload["partial_billing_quantities"])

        return ProductionOrderCreate(**payload)

    def _prepare_update(self, data: ProductionOrderUpdate) -> ProductionOrderUpdate:
        payload = data.model_dump(exclude_unset=True)

        if "delivery_completed_dates" in payload:
            payload["delivery_completed_dates"] = _normalize_dates(payload.get("delivery_completed_dates"))

        if "partial_billing_quantities" in payload:
            payload["partial_billing_quantities"] = _normalize_numbers(payload.get("partial_billing_quantities"))
            if payload.get("total_keping") in (None, 0, Decimal("0"), ""):
                payload["total_keping"] = _auto_total_keping(payload["partial_billing_quantities"])

        return ProductionOrderUpdate(**payload)

    def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
    ):
        return self.repository.get_all(search=search, status=status, month=month, year=year)

    def get_by_id(self, production_order_id: int):
        obj = self.repository.get_by_id(production_order_id)
        if not obj:
            raise HTTPException(status_code=404, detail="BKOrder tidak ditemukan")
        return obj

    def create(self, data: ProductionOrderCreate):
        return self.repository.create(self._prepare_create(data))

    def update(self, production_order_id: int, data: ProductionOrderUpdate):
        obj = self.repository.update(production_order_id, self._prepare_update(data))
        if not obj:
            raise HTTPException(status_code=404, detail="BKOrder tidak ditemukan")
        return obj

    def delete(self, production_order_id: int):
        obj = self.repository.delete(production_order_id)
        if not obj:
            raise HTTPException(status_code=404, detail="BKOrder tidak ditemukan")
        return {"message": "BKOrder berhasil dihapus"}

    def timeline(self, production_order_id: int):
        obj = self.get_by_id(production_order_id)
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
