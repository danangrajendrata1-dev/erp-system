from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.connection import Base


class Material(Base):

    __tablename__ = "materials"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    code = Column(
        String,
        unique=True,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    unit = Column(String)

    stock = Column(
        Integer,
        default=0
    )

    price = Column(
        Float,
        default=0
    )

    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id")
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    supplier = relationship(
        "Supplier"
    )