from sqlalchemy.orm import Session

from app.models.sales_103_model import Sales103
from app.schemas.sales_103_schema import Sales103Create, Sales103Update


class Sales103Repository:
    def get_all(self, db: Session):
        return db.query(Sales103).order_by(Sales103.id.asc()).all()

    def get_by_id(self, db: Session, sales_103_id: int):
        return (
            db.query(Sales103)
            .filter(Sales103.id == sales_103_id)
            .first()
        )

    def create(self, db: Session, data: Sales103Create):
        new_sales_103 = Sales103(**data.model_dump())

        db.add(new_sales_103)
        db.commit()
        db.refresh(new_sales_103)

        return new_sales_103

    def update(self, db: Session, sales_103_id: int, data: Sales103Update):
        sales_103 = self.get_by_id(db, sales_103_id)

        if not sales_103:
            return None

        update_data = data.model_dump()

        for field, value in update_data.items():
            setattr(sales_103, field, value)

        db.commit()
        db.refresh(sales_103)

        return sales_103

    def delete(self, db: Session, sales_103_id: int):
        sales_103 = self.get_by_id(db, sales_103_id)

        if not sales_103:
            return None

        db.delete(sales_103)
        db.commit()

        return sales_103