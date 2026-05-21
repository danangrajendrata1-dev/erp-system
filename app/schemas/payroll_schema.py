from pydantic import BaseModel
from datetime import date


class AttendanceCreateSchema(BaseModel):

    employee_id: int
    attendance_date: date
    status: str


class AttendanceResponseSchema(
    AttendanceCreateSchema
):

    id: int

    class Config:
        from_attributes = True


class PayrollCreateSchema(BaseModel):

    employee_id: int
    payroll_month: str
    bonus: float = 0
    deduction: float = 0


class PayrollResponseSchema(
    PayrollCreateSchema
):

    id: int
    base_salary: float
    final_salary: float
    status: str

    class Config:
        from_attributes = True