from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.schemas.user_schema import RegisterSchema, LoginSchema, UserResponseSchema
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["AUTH"]
)


@router.post("/register", response_model=UserResponseSchema)
def register(
    data: RegisterSchema,
    db: Session = Depends(get_db)
):
    existing_email = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_username = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
        role="ADMIN"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login")
def login(
    data: LoginSchema,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }