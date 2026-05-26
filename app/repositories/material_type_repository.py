from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.material_type_model import MaterialType
from app.schemas.material_type_schema import MaterialTypeCreate, MaterialTypeUpdate


class MaterialTypeRepository:

    def get_all(self, db: Session):
        return (
            db.query(MaterialType)
            .order_by(MaterialType.name.asc())
            .all()
        )

    def search(self, db: Session, keyword: str, limit: int = 10):
        query = db.query(MaterialType).filter(MaterialType.is_active == True)

        if keyword:
            query = query.filter(MaterialType.name.ilike(f"%{keyword}%"))

        return (
            query
            .order_by(MaterialType.name.asc())
            .limit(limit)
            .all()
        )

    def get_by_id(self, db: Session, material_id: int):
        return (
            db.query(MaterialType)
            .filter(MaterialType.id == material_id)
            .first()
        )

    def create(self, db: Session, data: MaterialTypeCreate):
        material = MaterialType(**data.model_dump())

        db.add(material)
        db.commit()
        db.refresh(material)

        return material

    def update(self, db: Session, material_id: int, data: MaterialTypeUpdate):
        material = self.get_by_id(db, material_id)

        if not material:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(material, key, value)

        db.commit()
        db.refresh(material)

        return material

    def delete(self, db: Session, material_id: int):
        material = self.get_by_id(db, material_id)

        if not material:
            return None

        db.delete(material)
        db.commit()

        return material