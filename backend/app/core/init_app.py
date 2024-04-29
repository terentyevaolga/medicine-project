import uuid
import time
import os
import logging
from datetime import date

from asyncio import sleep

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

from app.core.exceptions import APIException
from app.settings.log import DEFAULT_LOGGING
from app.settings.config import settings
from app.applications.users.models import User
from app.applications.users.schemas import BaseUserCreate
from app.core.auth.utils.password import get_password_hash

from app.core.auth.routers.login import router as login_router
from app.applications.users.routers import router as users_router
from app.applications.courses.routers import router as courses_router
from app.applications.files.routers import router as files_router
from app.applications.admin.routers import router as admin_router

from aerich import Command

def set_tz():
    os.environ["TZ"] = "Europe/Moscow"
    time.tzset()


def configure_logging(log_settings: dict = None):
    log_settings = log_settings or DEFAULT_LOGGING
    logging.config.dictConfig(log_settings)


def init_middlewares(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS
    )


def get_app_list() -> list:
    app_list = [f"{settings.APPLICATIONS_MODULE}.{app}.models" for app in settings.APPLICATIONS]
    return app_list


def get_tortoise_config() -> dict:
    app_list = get_app_list()
    app_list.append("aerich.models")
    config = {
        "connections": settings.DB_CONNECTIONS,
        "apps": {
            "models": {
                "models": app_list,
                "default_connection": "default"
            }
        }
    }
    print(config)
    return config

TORTOISE_ORM = get_tortoise_config()


def register_db(app: FastAPI, db_url: str = None):
    db_url = db_url or settings.DB_URL
    app_list = get_app_list()
    app_list.append("aerich.models")
    print(db_url)
    register_tortoise(
        app,
        db_url=db_url,
        modules={"models": app_list},
        generate_schemas=True,
        add_exception_handlers=True
    )


async def upgrade_db(app: FastAPI, db_url: str = None):
    command = Command(tortoise_config=TORTOISE_ORM, app="models", location="./migrations")
    if not os.path.exists("./migrations/models"):
        await command.init_db(safe=True)
    await command.init()
    await command.migrate(str(uuid.uuid4()))
    await command.upgrade(run_in_transaction=True)


async def create_default_admin_user():
    await sleep(3)
    user = await User.get_by_email(email="1jlaketuk1@gmail.com")
    if user:
        return

    admin_user = User()
    admin_user.fido = "Кулаков Никита"
    admin_user.email = "1jlaketuk1@gmail.com"
    admin_user.confirmed_email = True
    admin_user.is_admin = True
    admin_user.password_hash = get_password_hash("qwerty")
    admin_user.registration_date = date.today()
    await admin_user.save()
    return admin_user


def register_exceptions(app: FastAPI):
    app.exception_handler(APIException)


def register_routers(app: FastAPI):
    app.include_router(login_router, prefix="/auth/login", tags=["login"])
    app.include_router(users_router, prefix="/users", tags=["users"])
    app.include_router(courses_router, prefix="/courses", tags=["courses"])
    app.include_router(files_router, prefix="/files", tags=["files"])
    app.include_router(admin_router, prefix="/admin", tags=["admin"])