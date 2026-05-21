from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.payroll_schema import (
    AttendanceCreateSchema,
    AttendanceResponseSchema,
    PayrollCreateSchema,
    PayrollResponseSchema
)

from app.services.payroll_service import (
    create_attendance,
    get_attendance_list,
    create_payroll,
    get_payroll_list
)

router = APIRouter(
    prefix="/payroll",
    tags=["PAYROLL"]
)


@router.post(
    "/attendance",
    response_model=AttendanceResponseSchema
)
def create_att(
    data: AttendanceCreateSchema,
    db: Session = Depends(get_db)
):

    attendance = create_attendance(
        db,
        data
    )

    if not attendance:

        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return attendance


@router.get(
    "/attendance",
    response_model=list[
        AttendanceResponseSchema
    ]
)
def read_attendance(
    db: Session = Depends(get_db)
):

    return get_attendance_list(db)


@router.post(
    "/",
    response_model=PayrollResponseSchema
)
def create_salary(
    data: PayrollCreateSchema,
    db: Session = Depends(get_db)
):

    payroll = create_payroll(
        db,
        data
    )

    if not payroll:

        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return payroll


@router.get(
    "/",
    response_model=list[
        PayrollResponseSchema
    ]
)
def read_payroll(
    db: Session = Depends(get_db)
):

    return get_payroll_list(db)