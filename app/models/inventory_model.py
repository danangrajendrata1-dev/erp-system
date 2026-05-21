from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.connection import Base


class InventoryMovement(Base):

    __tablename__ = "inventory_movements"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    material_id = Column(
        Integer,
        ForeignKey("materials.id")
    )

    movement_type = Column(
        String
    )

    qty = Column(
        Integer
    )

    description = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    material = relationship(
        "Material"
    )