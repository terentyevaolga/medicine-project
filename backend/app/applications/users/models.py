from datetime import date
from typing import Optional, TYPE_CHECKING

from tortoise import fields
from tortoise.exceptions import DoesNotExist
from pydantic import UUID4

from app.applications.users.schemas import BaseUserCreate
if TYPE_CHECKING:
    from app.applications.courses.models import Test

from app.core.auth.utils import password

from app.core.base.base_models import BaseModel


class User(BaseModel):
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255, null=True)
    fido = fields.CharField(max_length=128)
    is_admin = fields.BooleanField(default=False)
    confirmed_email = fields.BooleanField(default=False)
    registration_date = fields.DateField()

    @classmethod
    async def get_by_email(cls, email: str) -> Optional["User"]:
        try:
            query = cls.get_or_none(email=email)
            user = await query
            return user
        except DoesNotExist:
            return None
        
    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["User"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            user = await query
            return user
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, user: BaseUserCreate) -> "User":
        user_dict = user.model_dump()
        password_hash = password.get_password_hash(password=user.password)
        model = cls(**user_dict, password_hash=password_hash, registration_date=date.today())
        await model.save()
        return model
    
    class Meta:
        table = "users"
