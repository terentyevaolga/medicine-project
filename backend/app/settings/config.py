import os

from decouple import config

import string
import random


class Settings:
    VERSION = "0.1.0"
    APP_TITLE = "Medicine"
    PROJECT_NAME = "Medicine"
    APP_DESCRIPTION = "Medicine"

    API_HOST = config("API_HOST")
    API_PORT = config("API_PORT")
    API_ROOT_PATH = "/" + config("API_ROOT_PATH")

    DEBUG = config("DEBUG", cast=bool, default=False)

    APPLICATIONS = [
        "users",
        "courses",
        "files"
    ]

    REDIS_HOST = config("REDIS_HOST")
    REDIS_PORT = config("REDIS_PORT")

    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    BASE_DIR = os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir))
    LOGS_ROOT = os.path.join(BASE_DIR, "app/logs")

    DB_USER = config("DB_USER")
    DB_NAME = config("DB_NAME")
    DB_PASS = config("DB_PASS")
    DB_HOST = config("DB_HOST")
    DB_PORT = config("DB_PORT")

    ROOT_ADMIN_PASSWORD = config("ROOT_ADMIN_PASSWORD")

    DB_URL = f"postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    DB_CONNECTIONS = {
        "default": DB_URL,
    }

    SECRET_KEY = config("SECRET_KEY", default="".join([random.choice(string.ascii_letters) for _ in range(32)]))
    JWT_ALGORITHM = "HS25"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 day

    LOGIN_URL = f"{API_ROOT_PATH}/auth/login/access-token" if API_ROOT_PATH != "/" else "/auth/login/access-token"

    APPLICATIONS_MODULE = "app.applications"

    CORS_ORIGINS = ["*"]
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_METHODS = ["*"]
    CORS_ALLOW_HEADERS = ["*"]

    DATA_PATH = "data/files/"

    MEDIA_TYPES = {
        "application": ["atom", "json", "pdf", "soap", "zip", "gzip", "msword", "yaml"],
        "audio": ["aac", "mpeg", "mp3", "ogg", "wav"],
        "image": ["gif", "jpeg", "pjpeg", "png", "svg", "tiff", "webp"],
        "text": ["cmd", "css", "csv", "html", "js", "plain", "php", "xml", "cpp", "h", "py", "java"],
        "video": ["mpeg", "mp4", "ogg", "webm"]
    }

    EMAIL = config("EMAIL")
    SMTP_HOST = config("SMTP_HOST")
    SMTP_PORT = config("SMTP_PORT")
    SMTP_LOGIN = config("SMTP_LOGIN")
    SMTP_PWD = config("SMTP_PWD")

    EMAIL_CONFIRMATION_CODE_EXPIRE_DELTA = 60 * 15 # 15 minutes

settings = Settings()
