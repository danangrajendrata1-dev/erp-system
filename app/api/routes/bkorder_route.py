from typing import List, Optional

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.bkorder_schema import (
    BKOrderCreate,
    BKOrderImportCommitRequest,
    BKOrderImportCommitResponse,
    BKOrderImportPreviewResponse,
    BKOrderResponse,
    BKOrderUpdate,
)
from app.services.bkorder_service import BKOrderService

# Prefix route dipasang di main.py:
# - /bkorders untuk nama baru yang lebih mudah dirawat.
# - /production-orders sebagai kompatibilitas endpoint lama.
router = APIRouter(tags=["BKOrder"])


@router.get("/", response_model=List[BKOrderResponse])
def get_bkorders(
    search: Optional[str] = None,
    status: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).get_all(
        search=search,
        status=status,
        month=month,
        year=year,
    )


@router.post("/import/preview", response_model=BKOrderImportPreviewResponse)
async def preview_bkorder_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    return BKOrderService(db).preview_import(content, file.filename or "")


@router.post("/import/commit", response_model=BKOrderImportCommitResponse)
def commit_bkorder_import(
    payload: BKOrderImportCommitRequest,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).commit_import(payload.rows)


@router.post("/", response_model=BKOrderResponse)
def create_bkorder(
    data: BKOrderCreate,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).create(data)


@router.get("/{bkorder_id}", response_model=BKOrderResponse)
def get_bkorder(
    bkorder_id: int,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).get_by_id(bkorder_id)


@router.put("/{bkorder_id}", response_model=BKOrderResponse)
def update_bkorder(
    bkorder_id: int,
    data: BKOrderUpdate,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).update(bkorder_id, data)


@router.delete("/{bkorder_id}")
def delete_bkorder(
    bkorder_id: int,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).delete(bkorder_id)


@router.get("/{bkorder_id}/timeline")
def get_bkorder_timeline(
    bkorder_id: int,
    db: Session = Depends(get_db),
):
    return BKOrderService(db).timeline(bkorder_id)
