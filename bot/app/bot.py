import telebot

from telebot.async_telebot import AsyncTeleBot
from app.cache import r, ping_redis_connection
from app.models import Channel
from app import settings


bot = AsyncTeleBot(settings.BOT_TOKEN)


@bot.my_chat_member_handler()
async def my_chat_m(message: telebot.types.ChatMemberUpdated):
    old = message.old_chat_member
    new = message.new_chat_member
    if new.status == "administrator":
        await Channel.create(id=message.chat.id)
        await bot.send_message(message.chat.id, "Somebody added me to channel")
    if new.status == "left" or new.status == "kicked":
        channel = await Channel.get_by_channel(id=message.chat.id)
        await channel.delete()