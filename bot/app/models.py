from tortoise.models import Model
from tortoise import fields
from tortoise.exceptions import DoesNotExist
from typing import Optional


class Channel(Model):
    id = fields.IntField(pk=True)
    channel = fields.BigIntField()

    @classmethod
    async def get_by_channel(cls, id: int) -> Optional["Channel"]:
        try:
            query = cls.get_or_none(channel=id)
            channel = await query
            return channel
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, id: int) -> "Channel":
        model = cls(channel=id)
        await model.save()
        return model
    
    class Meta:
        table="channels"