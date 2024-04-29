from datetime import datetime, timedelta, date
from typing import Optional
import uuid

from pydantic import BaseModel, EmailStr, UUID4, validator


class BaseProperties(BaseModel):
    @validator("uuid", pre=True, always=True, check_fields=False)
    def default_hashed_id(cls, v):
        return v or uuid.uuid4()
    

class BaseUser(BaseProperties):
    uuid: Optional[UUID4] = None
    email: Optional[EmailStr] = None
    fido: Optional[str] = None
    registration_date: Optional[date] = None


class BaseUserCreate(BaseProperties):
    email: EmailStr
    fido: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "my_email@email.com",
                "fido": "Name Surname",
                "password": "qwerty"
            }
        }


class BaseUserOut(BaseUser):
    uuid: UUID4
    email: EmailStr
    fido: str
    is_admin: bool
    registration_date: date

    class Config:
        from_attributes = True


class BaseConfirmEmail(BaseProperties):
    user_id: UUID4
    email: EmailStr
    time: datetime


class BaseConfirmedEmail(BaseProperties):
    user_id: UUID4
    email: EmailStr
    is_confirmed: bool


class ChangeName(BaseProperties):
    name: str


class ChangePassword(BaseProperties):
    password: str


class ChangeEmail(BaseProperties):
    email: EmailStr
