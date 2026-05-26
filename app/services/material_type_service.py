from sqlalchemy.orm import Session

from app.repositories.material_type_repository import MaterialTypeRepository
from app.schemas.material_type_schema import MaterialTypeCreate, MaterialTypeUpdate


class MaterialTypeService:

    def __init__(self):
        self.repository = MaterialTypeRepository()

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def search(self, db: Session, keyword: str, limit: int = 10):
        return self.repository.search(db, keyword, limit)

    def get_by_id(self, db: Session, material_id: int):
        return self.repository.get_by_id(db, material_id)

    def create(self, db: Session, data: MaterialTypeCreate):
        return self.repository.create(db, data)

    def update(self, db: Session, material_id: int, data: MaterialTypeUpdate):
        return self.repository.update(db, material_id, data)

    def delete(self, db: Session, material_id: int):
        return self.repository.delete(db, material_id)