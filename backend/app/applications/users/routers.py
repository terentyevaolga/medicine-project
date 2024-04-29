from typing import List
from datetime import datetime, timedelta

from pydantic import UUID4
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth.utils.contrib import get_current_user, get_current_admin
from app.core.auth.utils.password import get_password_hash

from app.applications.users.models import User
from app.applications.users.schemas import (
    BaseUserCreate,
    BaseUserOut,
    BaseConfirmEmail,
    BaseConfirmedEmail,
    ChangeName,
    ChangePassword,
    ChangeEmail
)
from app.applications.users.utils import send_email_confirmation_letter, send_email_code
from app.core.auth.routers.login import login_access_token
from app.core.auth.schemas import JWTToken

from app.redis.database import r
from app.settings.config import settings

import logging
import string

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=BaseUserOut, status_code=200)
async def get_user_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.patch("/me/fido", response_model=BaseUserOut, status_code=200)
async def change_name_me(
    name_in: ChangeName,
    current_user: User = Depends(get_current_user)
):
    current_user.fido = name_in.name
    await current_user.save()
    return current_user


@router.get("/me/password_change", response_model=BaseConfirmEmail, status_code=200)
async def send_change_password_letter(
    current_user: User = Depends(get_current_user)
):
    await send_email_code(current_user.email, 
                          current_user.uuid, 
                          type="change_password", 
                          text="Your password change confirm code", 
                          subject="Password change code")
    resp = BaseConfirmEmail(
        user_id=current_user.uuid, email=current_user.email, time=datetime.now()
    )
    return resp


@router.post("/me/password", response_model=BaseConfirmedEmail, status_code=200)
async def confirm_change_password(
    code: str,
    current_user: User = Depends(get_current_user)
):
    async with r.pipeline(transaction=True) as pipe:
        code_field = (await (pipe.hgetall(
            f"{current_user.uuid}:change_password"
        ).execute()))[0]

    if code_field == {}:
        raise HTTPException(
                status_code=404,
                detail="Confirmation code did not been sent"
            )
    
    if code_field["code"] != code:
        raise HTTPException(
                status_code=422,
                detail="Incorrect confirmation code"
            )
        
    if code_field["email"] != current_user.email:
        raise HTTPException(
            status_code=422,
            detail="Incorrect email"
        )
    
    if datetime.utcnow() - datetime.strptime(code_field["time"], '%Y-%m-%d %H:%M:%S.%f') > timedelta(seconds=settings.EMAIL_CONFIRMATION_CODE_EXPIRE_DELTA):
        raise HTTPException(
            status_code=410,
            detail="Confirmation code has been expired"
        )
    
    await (pipe.delete(f"{current_user.uuid}:change_password").execute())
    
    confirmation_field = await (pipe.hset(
                f"{current_user.uuid}:change_password",
                mapping={
                    "code": code,
                    "email": current_user.email,
                    "time": datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S.%f'),
                    "status": "confirmed"
                }).execute()
            )
    
    return BaseConfirmedEmail(
        user_id=current_user.uuid,
        email=current_user.email,
        is_confirmed=True
    )


@router.patch("/me/password", status_code=204)
async def change_password(
    password: ChangePassword,
    current_user: User = Depends(get_current_user)
):
    async with r.pipeline(transaction=True) as pipe:
        code_field = (await (pipe.hgetall(
            f"{current_user.uuid}:change_password"
        ).execute()))[0]

    if code_field == {}:
        raise HTTPException(
                status_code=404,
                detail="Confirmation code did not been sent"
            )
    
    if datetime.utcnow() - datetime.strptime(code_field["time"], '%Y-%m-%d %H:%M:%S.%f') > timedelta(seconds=settings.EMAIL_CONFIRMATION_CODE_EXPIRE_DELTA):
        raise HTTPException(
            status_code=410,
            detail="Confirmation code has been expired"
        )
    
    await (pipe.delete(f"{current_user.uuid}:change_password").execute())
    hashed_password = get_password_hash(password=password.password)
    current_user.password_hash = hashed_password
    await current_user.save()
    return


@router.post("/me/email/send", response_model=BaseConfirmEmail, status_code=200)
async def send_change_email_letter(
    email: ChangeEmail,
    current_user: User = Depends(get_current_user)
):
    await send_email_code(email.email, 
                          current_user.uuid, 
                          type="change_email", 
                          text="Your email change confirm code", 
                          subject="Email change code")
    resp = BaseConfirmEmail(
        user_id=current_user.uuid, email=email.email, time=datetime.now()
    )
    return resp


@router.post("/me/email", response_model=BaseConfirmedEmail, status_code=200)
async def confirm_change_email(
    code: str,
    current_user: User = Depends(get_current_user)
):
    async with r.pipeline(transaction=True) as pipe:
        code_field = (await (pipe.hgetall(
            f"{current_user.uuid}:change_email"
        ).execute()))[0]

    if code_field == {}:
        raise HTTPException(
                status_code=404,
                detail="Confirmation code did not been sent"
            )
    
    if code_field["code"] != code:
        raise HTTPException(
                status_code=422,
                detail="Incorrect confirmation code"
            )
    
    if datetime.utcnow() - datetime.strptime(code_field["time"], '%Y-%m-%d %H:%M:%S.%f') > timedelta(seconds=settings.EMAIL_CONFIRMATION_CODE_EXPIRE_DELTA):
        raise HTTPException(
            status_code=410,
            detail="Confirmation code has been expired"
        )
    
    await (pipe.delete(f"{current_user.uuid}:change_email").execute())
    
    current_user.email = code_field["email"]
    await current_user.save()
    
    return BaseConfirmedEmail(
        user_id=current_user.uuid,
        email=current_user.email,
        is_confirmed=True
    )


@router.post("/", response_model=JWTToken, status_code=201)
async def create_user(
    *,
    user_in: BaseUserCreate
):
    user = await User.get_by_email(email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists"
        )

    hashed_password = get_password_hash(user_in.password)
    db_user = BaseUserCreate(**user_in.model_dump(), hashed_password=hashed_password)
    user = await User.create(db_user)

    await send_confirmation_letter(user)
    access_token = await login_access_token(OAuth2PasswordRequestForm(username=user.email, 
                                                                        password=user_in.password))

    return access_token

@router.get("/me/confirm", response_model=BaseConfirmEmail, status_code=200)
async def send_confirmation_letter(
    current_user: User = Depends(get_current_user)
):
    if current_user.confirmed_email:
        raise HTTPException(
            status_code=422,
            detail="The user already have confirmed email"
        )
    
    await send_email_confirmation_letter(current_user.email, current_user.uuid)
    resp = BaseConfirmEmail(
        user_id=current_user.uuid, email=current_user.email, time=datetime.now()
    )
    return resp


@router.post("/me/confirm", response_model=BaseConfirmedEmail, status_code=201)
async def confirm_email(
    code: str,
    current_user: User = Depends(get_current_user)
):
    async with r.pipeline(transaction=True) as pipe:
        code_field = (await (pipe.hgetall(
            f"{current_user.uuid}:confirmation"
        ).execute()))[0]

    if code_field == {}:
        raise HTTPException(
                status_code=404,
                detail="Confirmation code did not been sent"
            )
    
    if code_field["code"] != code:
        raise HTTPException(
                status_code=422,
                detail="Incorrect confirmation code"
            )
        
    if code_field["email"] != current_user.email:
        raise HTTPException(
            status_code=422,
            detail="Incorrect email"
        )
    
    if datetime.utcnow() - datetime.strptime(code_field["time"], '%Y-%m-%d %H:%M:%S.%f') > timedelta(seconds=settings.EMAIL_CONFIRMATION_CODE_EXPIRE_DELTA):
        raise HTTPException(
            status_code=410,
            detail="Confirmation code has been expired"
        )
    
    await (pipe.delete(f"{current_user.uuid}:confirmation").execute())

    current_user.confirmed_email = True
    await current_user.save()

    return BaseConfirmedEmail(
        user_id=current_user.uuid,
        email=current_user.email,
        is_confirmed=current_user.confirmed_email
    )