import uuid
from typing import Optional

from pydantic import BaseModel, UUID4, validator


class BaseProperties(BaseModel):
    @validator("uuid", pre=True, always=True, check_fields=False)
    def default_hashed_id(cls, v):
        return v or uuid.uuid4()
    

class BaseFile(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None
    type: Optional[str] = None
    path: Optional[str] = None


class BaseFileCreate(BaseProperties):
    title: str
    type: Optional[str] = None
    path: Optional[str] = None

    class Meta:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "some_file",
                "type": "txt",
                "path": "data/file.txt"
            }
        }


class BaseFileOut(BaseProperties):
    uuid: UUID4
    title: str
    type: str
    path: str

    class Meta:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "uuid": "0",
                "title": "some_file",
                "type": "txt",
                "path": "data/file.txt"
            }
        }