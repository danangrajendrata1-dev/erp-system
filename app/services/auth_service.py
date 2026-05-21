from sqlalchemy.orm import Session

from app.models.user_model import User

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


def register_user(
    db: Session,
    data
):

    user = User(
        username=data.username,
        email=data.email,
        password=hash_password(
            data.password
        )
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user


def login_user(
    db: Session,
    data
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        return None

    valid = verify_password(
        data.password,
        user.password
    )

    if not valid:
        return None

    token = create_access_token({

        "user_id": user.id,
        "email": user.email,
        "role": user.role

    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }