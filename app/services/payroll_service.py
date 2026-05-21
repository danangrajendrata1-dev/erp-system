from sqlalchemy.orm import Session

from app.models.employee_model import (
    Employee
)

from app.models.payroll_model import (
    Attendance,
    Payroll
)


def create_attendance(
    db: Session,
    data
):

    employee = db.query(Employee).filter(
        Employee.id == data.employee_id
    ).first()

    if not employee:
        return None

    attendance = Attendance(
        employee_id=data.employee_id,
        attendance_date=data.attendance_date,
        status=data.status
    )

    db.add(attendance)

    db.commit()

    db.refresh(attendance)

    return attendance


def get_attendance_list(
    db: Session
):

    return db.query(
        Attendance
    ).all()


def create_payroll(
    db: Session,
    data
):

    employee = db.query(Employee).filter(
        Employee.id == data.employee_id
    ).first()

    if not employee:
        return None

    final_salary = (
        employee.salary +
        data.bonus -
        data.deduction
    )

    payroll = Payroll(
        employee_id=data.employee_id,
        payroll_month=data.payroll_month,
        base_salary=employee.salary,
        bonus=data.bonus,
        deduction=data.deduction,
        final_salary=final_salary
    )

    db.add(payroll)

    db.commit()

    db.refresh(payroll)

    return payroll


def get_payroll_list(
    db: Session
):

    return db.query(
        Payroll
    ).all()