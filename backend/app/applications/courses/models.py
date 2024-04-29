from typing import Optional

from tortoise import fields
from tortoise.exceptions import DoesNotExist
from pydantic import UUID4

from app.core.base.base_models import BaseModel
from app.applications.courses.schemas import (BaseCourseCreate, 
                                              BaseThemeCreate, 
                                              BasePartCreate, 
                                              BaseSourceCreate, 
                                              BaseTestCreate, 
                                              TestResultsCreate,
                                              BaseFileSourceCreate)
from app.applications.files.models import File
from app.applications.users.models import User


class Course(BaseModel):
    title = fields.CharField(max_length=16)
    # themes = fields.ManyToManyRelation["Theme"] = fields.ManyToManyField(
    #     "models.Theme", related_name="disciplines", through="courses_themes", to_field="uuid"
    # )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["Course"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def get_by_title(cls, title: str) -> Optional["Course"]:
        try:
            query = cls.get_or_none(title=title)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, course: BaseCourseCreate) -> "Course":
        model = cls(**course.model_dump())
        await model.save()
        return model

    class Config:
        table = "courses"


class Theme(BaseModel):
    title = fields.CharField(max_length=32)
    course: fields.ForeignKeyRelation["Course"] = fields.ForeignKeyField(
        "models.Course", related_name="discipline", to_field="uuid", on_delete=fields.CASCADE
    )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["Theme"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def get_by_title(cls, title: str) -> Optional["Theme"]:
        try:
            query = cls.get_or_none(title=title)
            model = await query
            return model
        except DoesNotExist:
            return None

    @classmethod
    async def create(cls, theme: BaseThemeCreate) -> "Theme":
        model = cls(**theme.model_dump())
        await model.save()
        return model

    class Config:
        table = "themes"


class Part(BaseModel):
    title = fields.CharField(max_length=64)
    theme: fields.ForeignKeyRelation["Theme"] = fields.ForeignKeyField(
        "models.Theme", related_name="theme_part", to_field="uuid", on_delete=fields.CASCADE
    )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["Part"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def get_by_title(cls, title: str) -> Optional["Part"]:
        try:
            query = cls.get_or_none(title=title)
            model = await query
            return model
        except DoesNotExist:
            return None

    @classmethod
    async def create(cls, part: BasePartCreate) -> "Part":
        model = cls(**part.model_dump())
        await model.save()
        return model    

    class Config:
        table = "parts"


class Source(BaseModel):
    title = fields.CharField(max_length=64)
    link = fields.CharField(max_length=512)
    part: fields.ForeignKeyRelation["Part"] = fields.ForeignKeyField(
        "models.Part", related_name="part_video", to_field="uuid", on_delete=fields.CASCADE
    )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["Source"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, source: BaseSourceCreate) -> "Source":
        model = cls(**source.model_dump())
        await model.save()
        return model    

    class Config:
        table = "sources"


class ArticleSource(BaseModel):
    title = fields.CharField(max_length=128)
    link = fields.CharField(max_length=512)
    part: fields.ForeignKeyRelation["Part"] = fields.ForeignKeyField(
        "models.Part", related_name="part_article", to_field="uuid", on_delete=fields.CASCADE
    )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["ArticleSource"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, source: BaseSourceCreate) -> "ArticleSource":
        model = cls(**source.model_dump())
        await model.save()
        return model    
    
    class Config:
        table = "article_sources"


class FileSource(BaseModel):
    title = fields.CharField(max_length=128)
    type = fields.CharField(max_length=32, null=True)
    part: fields.ForeignKeyRelation["Part"] = fields.ForeignKeyField(
        "models.Part", related_name="part_source", to_field="uuid", on_delete=fields.CASCADE
    )
    file: fields.ForeignKeyRelation["File"] = fields.ForeignKeyField(
        "models.File", related_name="part_file", to_field="uuid", on_delete=fields.CASCADE
    )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["FileSource"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, source: BaseFileSourceCreate, file_id: UUID4) -> "FileSource":
        model = cls(**source.model_dump(), file_id=file_id)
        await model.save()
        return model  


class Test(BaseModel):
    title = fields.CharField(max_length=64)
    part: fields.ForeignKeyRelation["Part"] = fields.ForeignKeyField(
        "models.Part", related_name="examing", to_field="uuid", on_delete=fields.CASCADE
    )
    file: fields.ForeignKeyRelation["File"] = fields.ForeignKeyField(
        "models.File", related_name="questions", to_field="uuid", on_delete=fields.CASCADE
    )

    @classmethod
    async def get_by_uuid(cls, uuid: UUID4) -> Optional["Test"]:
        try:
            query = cls.get_or_none(uuid=uuid)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, test: BaseTestCreate) -> "Test":
        model = cls(**test.model_dump())
        await model.save()
        return model    

    class Config:
        table = "test"


class TestResults(BaseModel):
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        "models.User", related_name="user_results", to_fields="uuid", on_delete=fields.CASCADE
    )
    test: fields.ForeignKeyRelation["Test"] = fields.ForeignKeyField(
        "models.Test", related_name="test_results", to_field="uuid", on_delete=fields.CASCADE
    )
    score = fields.IntField()
    questions_number = fields.IntField()
    percentage = fields.FloatField(null=True)
    date = fields.DateField()

    @classmethod
    async def get_by_user(cls, user: User) -> Optional["TestResults"]:
        try:
            query = cls.get_or_none(user=user)
            model = await query
            return model
        except DoesNotExist:
            return None
        
    @classmethod
    async def create(cls, test: TestResultsCreate) -> "TestResults":
        percentage = (test.score / test.questions_number) * 100
        model = cls(**test.model_dump(), percentage=percentage)
        await model.save()
        return model    

    class Config:
        table = "test"
    
