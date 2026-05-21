from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.user_model import User

from app.core.security import (
    verify_token
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = verify_token(token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == payload["user_id"]
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


def admin_only(
    current_user: User = Depends(
        get_current_user
    )
):

    if current_user.role != "ADMIN":

        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )

    return current_user