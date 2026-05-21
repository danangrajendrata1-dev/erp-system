from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime

from datetime import datetime

from app.database.connection import Base


class CashTransaction(Base):

    __tablename__ = "cash_transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transaction_type = Column(
        String
    )

    amount = Column(
        Float,
        default=0
    )

    description = Column(
        String
    )

    transaction_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )