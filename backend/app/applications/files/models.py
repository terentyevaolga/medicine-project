from typing import Optional

from tortoise import fields
from tortoise.exceptions import DoesNotExist
from pydantic import UUID4

from app.core.base.base_models import BaseModel
from app.applications.files.schemas import BaseFileCreate


class File(BaseModel):
    title = fields.CharField(max_length=256)
    type = fields.CharField(max_length=16, null=True)
    path = fields.CharField(max_length=256, null=True)

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["File"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, file: BaseFileCreate) -> "File":
        model = cls(**file.model_dump())
        await model.save()
        return model    

    class Config:
        table = "files"