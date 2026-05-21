from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.dashboard_service import (
    get_dashboard_summary
)

router = APIRouter(
    prefix="/dashboard",
    tags=["DASHBOARD"]
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db)
):

    return get_dashboard_summary(db)