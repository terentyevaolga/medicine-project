import os
import uuid
import codecs
import json
from typing import List
from datetime import datetime, timedelta

from pydantic import UUID4
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File as FileReq

from app.core.auth.utils.contrib import get_current_user, get_current_admin
from app.applications.users.models import User
from app.applications.users.schemas import BaseUserOut
from app.applications.courses.models import Course, Theme, Part, Source, Test, FileSource, ArticleSource
from app.applications.courses.schemas import (
    BaseCourseCreate,
    BaseCourseOut,
    BaseThemeCreate,
    BaseThemeOut,
    BasePartCreate,
    BasePartOut,
    BaseSourceCreate,
    BaseSourceOut,
    SourceCreateText,
    BaseTestCreate,
    BaseTestOut,
    CourseWithParticipants,
    ThemeWithParticipants,
    PartWithParticipants,
    QuestionData,
    TestQuestionsCreate,
    BaseFileSourceOut,
    BaseFileSourceCreate,
    SourceCreateAdmin,
    FileSourceCreateAdmin
)
from app.applications.admin.texts import default_bot_message_text
from app.applications.files.models import File
from app.applications.files.schemas import BaseFileCreate
from app.applications.files.routers import create_and_upload_file
from app.redis.database import ping_redis_connection, r

from app.settings.config import settings


router = APIRouter()


@router.get("/users", response_model=List[BaseUserOut], status_code=200)
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin)
):
    users = await User.all().offset(offset=skip).limit(limit=limit)
    return users


@router.delete("/users/{uuid}", status_code=204)
async def delete_user(
    uuid: UUID4,
    current_user: User = Depends(get_current_admin)
):
    user = await User.get_by_uuid(uuid=uuid)
    if user is None:
        raise HTTPException(
            status_code=404,
            detail="The user with this uuid does not exist"
        )
    
    await user.delete()


@router.post("/test", response_model=BaseTestOut, status_code=201)
async def create_test(
    test_data: TestQuestionsCreate,
    current_user: User = Depends(get_current_admin)
):
    test_data_json = json.dumps(test_data.model_dump(exclude=["title", "part_id"]), ensure_ascii=True)
    try:
        file_path = f"{settings.DATA_PATH}{str(uuid.uuid4())}.json"
        with codecs.open(file_path, "w", encoding="utf-8") as f:
            f.write(test_data_json)
        file_db = BaseFileCreate(title=test_data.title, type="json", path=file_path)
        file = await File.create(file=file_db)
    except Exception():
        raise HTTPException(status_code=400, detail="Unable to write file")
    test_db = BaseTestCreate(title=test_data.title, part_id=test_data.part_id, file_id=file.uuid)
    test = await Test.create(test=test_db)
    return test


@router.post("/file-source", response_model=BaseFileSourceOut, status_code=201)
async def create_file_source(
    source_in: BaseFileSourceCreate = Depends(BaseFileSourceCreate.as_form),
    current_user: User = Depends(get_current_admin),
    file: UploadFile = FileReq(...),
):
    part = await Part.get_by_uuid(uuid=source_in.part_id)
    if part is None:
        raise HTTPException(
            status_code=404,
            detail="The part with this uuid does not exist"
        )
    file_field = await create_and_upload_file(current_user, file=file)

    file_source_field = await FileSource.create(source=source_in, file_id=file_field.uuid)

    if source_in.type == "manual":
        text = default_bot_message_text(material_type="manuals", id=file_source_field.uuid)
    elif source_in.type == "summary":
        text = default_bot_message_text(material_type="synopsis", id=file_source_field.uuid)
    data = {
        "text": text
    }
    data_json = json.dumps(data)
    await r.lpush("post", data_json)

    return file_source_field


@router.post("/file-source-text", response_model=BaseFileSourceOut, status_code=201)
async def create_file_source_text(
    source_in: FileSourceCreateAdmin = Depends(FileSourceCreateAdmin.as_form),
    current_user: User = Depends(get_current_user),
    file: UploadFile = FileReq(...)
):
    part = await Part.get_by_title(title=source_in.part_title)
    if part is None:
        raise HTTPException(
            status_code=404,
            detail="The part with this uuid does not exist"
        )
    file_field = await create_and_upload_file(current_user, file=file)

    source_model = BaseFileSourceCreate(title=source_in.title, type=source_in.type, part_id=part.uuid)
    file_source_field = await FileSource.create(source=source_model, file_id=file_field.uuid)

    if source_in.type == "manual":
        text = default_bot_message_text(material_type="manuals", id=file_source_field.uuid)
    elif source_in.type == "summary":
        text = default_bot_message_text(material_type="synopsis", id=file_source_field.uuid)
    data = {
        "text": text
    }
    data_json = json.dumps(data)
    await r.lpush("post", data_json)

    return file_source_field


@router.delete("/file-source/{uuid}", status_code=204)
async def delete_file_source(
    uuid: UUID4,
    current_user: User = Depends(get_current_admin)
):
    source = await FileSource.get_by_uuid(uuid=uuid)
    file = await File.get_by_uuid(uuid=source.file_id)
    if os.path.exists(file.path):
        os.remove(file.path)
    try:
        await source.delete()
        await file.delete()
    except:
        return
    

@router.post("/article", response_model=BaseSourceOut, status_code=201)
async def create_article(
    article_in: SourceCreateAdmin,
    current_user: User = Depends(get_current_admin)
):
    part = await Part.get_by_title(title=article_in.part_title)
    if part is None:
        raise HTTPException(
            status_code=404,
            detail="The part with this uuid does not exist"
        )

    source_model = BaseSourceCreate(title=article_in.title, link=article_in.link, part_id=part.uuid)
    source = await ArticleSource.create(source=source_model)

    text = default_bot_message_text(material_type="articles", id=source.uuid)
    data = {
        "text": text
    }
    data_json = json.dumps(data)
    await r.lpush("post", data_json)

    return source


@router.delete("/article/{uuid}", status_code=204)
async def delete_source(
    uuid: UUID4,
    current_user: User = Depends(get_current_admin)
):
    source = await ArticleSource.get_by_uuid(uuid=uuid)
    await source.delete()


@router.patch("/file_source_temp", response_model=BaseFileSourceOut, status_code=200)
async def file_source_change_type(
    source_id: UUID4,
    type: str,
    current_user: User = Depends(get_current_admin),
):
    file_source = await FileSource.get_by_uuid(uuid=source_id)
    if file_source is None:
        raise HTTPException(
            status_code=404,
            detail="The file source with this uuid does not exist"
        )
    
    file_source.type = type
    await file_source.save()

    return file_source


@router.post("/source", response_model=BaseSourceOut, status_code=201)
async def create_source(
    source_in: SourceCreateAdmin,
    current_user: User = Depends(get_current_admin)
):
    part = await Part.get_by_title(title=source_in.part_title)
    if part is None:
        raise HTTPException(
            status_code=404,
            detail="The part with this uuid does not exist"
        )

    source_model = BaseSourceCreate(title=source_in.title, link=source_in.link, part_id=part.uuid)
    source = await Source.create(source=source_model)

    text = default_bot_message_text(material_type="lectures", id=source.uuid)
    data = {
        "text": text
    }
    data_json = json.dumps(data)
    await r.lpush("post", data_json)

    return source


@router.post("/source/text", response_model=BaseSourceOut, status_code=201)
async def create_source_text(
    source_in: SourceCreateText,
    current_user: User = Depends(get_current_admin)
):
    course = await Course.get_by_title(title=source_in.title)
    if course is None:
        raise HTTPException(
            status_code=404,
            detail="The course with this uuid does not exist"
        )
    theme = await Theme.get_by_title(title=source_in.theme_text)
    if theme is None:
        raise HTTPException(
            status_code=404,
            detail="The theme with this uuid does not exist"
        )
    part = await Part.get_by_title(title=source_in.title)
    if part is None:
        raise HTTPException(
            status_code=404,
            detail="The part with this uuid does not exist"
        )
    source_model = BaseSourceCreate(title=source_in.title, link=source_in.link, part_id=part.uuid)
    source = await Source.create(source=source_model)

    text = default_bot_message_text(material_type="lectures", id=source.uuid)
    data = {
        "text": text
    }
    data_json = json.dumps(data)
    await r.lpush("post", data_json)

    return source


@router.delete("/source/{uuid}", status_code=204)
async def delete_source(
    uuid: UUID4,
    current_user: User = Depends(get_current_admin)
):
    source = await Source.get_by_uuid(uuid=uuid)
    await source.delete()


@router.post("/course", response_model=BaseCourseOut, status_code=201)
async def create_course(
    course_in: BaseCourseCreate,
    current_user: User = Depends(get_current_admin)
):
    course = await Course.create(course=course_in)
    return course


@router.post("/theme", response_model=BaseThemeOut, status_code=201)
async def create_theme(
    theme_in: BaseThemeCreate,
    current_user: User = Depends(get_current_admin)
):
    theme = await Theme.create(theme=theme_in)
    return theme


@router.post("/part", response_model=BasePartOut, status_code=201)
async def create_part(
    part_in: BasePartCreate,
    current_user: User = Depends(get_current_admin)
):
    part = await Part.create(part=part_in)
    return part