from pydantic import BaseModel, UUID4
from typing import List


class CredentialsSchema(BaseModel):
    email: str | None
    password: str

    class Config:
        json_schema_extra = {"example": {"email": "my_email@gmail.com", "password": "qwerty"}}


class JWTToken(BaseModel):
    access_token: str
    token_type: str


class JWTTokenData(BaseModel):
    mail: str = None


class JWTTokenPayload(BaseModel):
    user_uuid: UUID4 = None


class Msg(BaseModel):
    msg: str