import time
import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.bot import bot
from app.db import init_db
from app.handler import check_for_new_posts

if __name__ == "__main__":
    while True:
        try:
            loop = asyncio.get_event_loop()
            f1 = loop.create_task(init_db())
            scheduler = AsyncIOScheduler()
            scheduler.add_job(check_for_new_posts, "interval", seconds=10)
            f = loop.create_task(bot.polling(none_stop=True))
            scheduler.start()
            loop.run_forever()
        except Exception as e:
            delay = 3
            text = f"Error: {e.with_traceback()}, restarting after {delay} seconds"
            print(text)
            time.sleep(delay)
            text = f"Restarted"
            print(text)
        