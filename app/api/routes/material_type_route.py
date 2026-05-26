from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.material_type_schema import (
    MaterialTypeCreate,
    MaterialTypeUpdate,
    MaterialTypeResponse,
)
from app.services.material_type_service import MaterialTypeService


router = APIRouter(
    prefix="/material-types",
    tags=["Material Types"]
)

service = MaterialTypeService()


@router.get("/", response_model=List[MaterialTypeResponse])
def get_material_types(db: Session = Depends(get_db)):
    return service.get_all(db)


@router.get("/search", response_model=List[MaterialTypeResponse])
def search_material_types(
    q: str = Query(default=""),
    limit: int = Query(default=10),
    db: Session = Depends(get_db),
):
    return service.search(db, q, limit)


@router.post("/", response_model=MaterialTypeResponse)
def create_material_type(
    data: MaterialTypeCreate,
    db: Session = Depends(get_db),
):
    return service.create(db, data)


@router.get("/{material_id}", response_model=MaterialTypeResponse)
def get_material_type(
    material_id: int,
    db: Session = Depends(get_db),
):
    material = service.get_by_id(db, material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Jenis bahan tidak ditemukan")

    return material


@router.put("/{material_id}", response_model=MaterialTypeResponse)
def update_material_type(
    material_id: int,
    data: MaterialTypeUpdate,
    db: Session = Depends(get_db),
):
    material = service.update(db, material_id, data)

    if not material:
        raise HTTPException(status_code=404, detail="Jenis bahan tidak ditemukan")

    return material


@router.delete("/{material_id}")
def delete_material_type(
    material_id: int,
    db: Session = Depends(get_db),
):
    material = service.delete(db, material_id)

    if not material:
        raise HTTPException(status_code=404, detail="Jenis bahan tidak ditemukan")

    return {
        "status": "success",
        "message": "Jenis bahan berhasil dihapus"
    }