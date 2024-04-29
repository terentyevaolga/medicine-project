from tortoise import Tortoise
from app import settings
from app.cache import ping_redis_connection, r

async def init_db(db_url: str | None = None):
    await Tortoise.init(
        db_url=db_url or settings.DB_URL,
        modules={"models": ["app.models"]}
    )

    await Tortoise.generate_schemas()
    print(f"Connected to DB")
    await ping_redis_connection(r)