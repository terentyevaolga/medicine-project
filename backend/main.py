import uvicorn

from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.exceptions import SettingNotFound
from app.core.init_app import (
    configure_logging,
    init_middlewares,
    register_db,
    upgrade_db,
    register_exceptions,
    register_routers,
    set_tz,
    create_default_admin_user
)
from app.applications.fill.routers import fill_parts, fill_themes
from app.redis.database import ping_redis_connection, r

try:
    from app.settings.config import settings
except ImportError:
    raise SettingNotFound("Cannot import settings. Create settings file from template.config.py")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.VERSION,
    debug=settings.DEBUG,
    swagger_ui_parameters={"persistAuthorization": True},
    # root_path=settings.API_ROOT_PATH
)


main_app_lifespan = app.router.lifespan_context
@asynccontextmanager
async def lifespan_wrapper(app):
    await upgrade_db(app)
    register_db(app)
    await ping_redis_connection(r)
    await create_default_admin_user()
    await fill_themes()
    await fill_parts()
    async with main_app_lifespan(app) as maybe_state:
        yield maybe_state
app.router.lifespan_context = lifespan_wrapper


set_tz()
configure_logging()
init_middlewares(app)
register_exceptions(app)
register_routers(app)


if __name__ == "__main__":
    uvicorn.run(app, host=settings.API_HOST, port=int(settings.API_PORT))
