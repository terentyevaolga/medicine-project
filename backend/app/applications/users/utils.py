from typing import Optional
from datetime import datetime

from smtplib import SMTP_SSL as SMTP
from email.mime.text import MIMEText
from random import randint

from fastapi.exceptions import HTTPException
from pydantic import UUID4

from app.applications.users.models import User
from app.redis.database import r

from app.settings.config import settings


async def send_email_confirmation_letter(to: str, user_id: UUID4):
    try:
        digits = "".join([f"{randint(0, 9)}" for _ in range(6)])
        msg = MIMEText(f"Your code confirmation is: {digits}")

        msg["Subject"] = "The email confirmation code"
        msg["From"] = settings.EMAIL
        msg["To"] = to

        conn = SMTP(
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT
        )
        conn.set_debuglevel(False)
        conn.login(settings.SMTP_LOGIN, settings.SMTP_PWD)
        try:
            conn.sendmail(settings.EMAIL, to, msg.as_string())
        finally:
            conn.quit()

        async with r.pipeline(transaction=True) as pipe:
            confirmation_mail = await (pipe.hgetall(f"{user_id}:confirmation").execute())

        if confirmation_mail is not None:
            await (pipe.delete(f"{user_id}:confirmation").execute())

        confirmation_field = await (pipe.hset(
                f"{user_id}:confirmation",
                mapping={
                    "code": digits,
                    "email": to,
                    "time": datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S.%f')
                }).execute()
            )

    except:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong with email sending"
        )


async def send_email_code(to: str, user_id: UUID4, type: str, text: str, subject: str):
    try:
        digits = "".join([f"{randint(0, 9)}" for _ in range(6)])
        msg = MIMEText(f"{text}: {digits}")

        msg["Subject"] = subject
        msg["From"] = settings.EMAIL
        msg["To"] = to

        conn = SMTP(
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT
        )
        conn.set_debuglevel(False)
        conn.login(settings.SMTP_LOGIN, settings.SMTP_PWD)
        try:
            conn.sendmail(settings.EMAIL, to, msg.as_string())
        finally:
            conn.quit()

        async with r.pipeline(transaction=True) as pipe:
            confirmation_mail = await (pipe.hgetall(f"{user_id}:{type}").execute())

        if confirmation_mail is not None:
            await (pipe.delete(f"{user_id}:{type}").execute())

        confirmation_field = await (pipe.hset(
                f"{user_id}:{type}",
                mapping={
                    "code": digits,
                    "email": to,
                    "time": datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S.%f'),
                    "status": "sent"
                }).execute()
            )

    except:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong with email sending"
        )
