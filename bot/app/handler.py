import json
from app.cache import r
from app.models import Channel
from app.bot import bot

async def check_for_new_posts():
    request = await r.rpop("post")
    if request is None:
        return
    data = json.loads(request)
    channels = await Channel.all()
    for channel in channels:
        await bot.send_message(chat_id=channel.channel,
                               text=data["text"])