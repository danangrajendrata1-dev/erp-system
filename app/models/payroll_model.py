from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Date
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.connection import Base


class Attendance(Base):

    __tablename__ = "attendance"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id")
    )

    attendance_date = Column(
        Date
    )

    status = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    employee = relationship(
        "Employee"
    )


class Payroll(Base):

    __tablename__ = "payroll"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id")
    )

    payroll_month = Column(
        String
    )

    base_salary = Column(
        Float,
        default=0
    )

    bonus = Column(
        Float,
        default=0
    )

    deduction = Column(
        Float,
        default=0
    )

    final_salary = Column(
        Float,
        default=0
    )

    status = Column(
        String,
        default="UNPAID"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    employee = relationship(
        "Employee"
    )