from pydantic import BaseModel
from pydantic import EmailStr


class RegisterSchema(BaseModel):

    username: str
    email: EmailStr
    password: str


class LoginSchema(BaseModel):

    email: EmailStr
    password: str


class UserResponseSchema(BaseModel):

    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True