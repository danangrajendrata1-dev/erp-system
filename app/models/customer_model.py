from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.connection import Base


class Customer(Base):

    __tablename__ = "customers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    phone = Column(String)

    address = Column(String)

    company = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )