from os import path, makedirs
import uuid as uuid_
import shutil

from pydantic import UUID4

from app.applications.users.models import User
from app.core.auth.utils.contrib import get_current_admin
from app.applications.files.models import File as FileModel
from app.applications.files.schemas import BaseFileCreate, BaseFileOut

from app.settings.config import settings

from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi import File
from fastapi.responses import FileResponse
from fastapi.concurrency import run_in_threadpool

router = APIRouter()


@router.get("/", response_model=List[BaseFileOut], status_code=201)
async def read_files_info(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin)
):
    files = await FileModel.all().limit(limit=limit).offset(skip)
    return files


@router.post("/", response_model=BaseFileOut, status_code=201)
async def create_and_upload_file(
    user: User = Depends(get_current_admin),
    file: UploadFile = File(...),
):
    file_data = file.filename.split('.', -1)
    file_type = "".join(file_data[-1])
    file_data.pop(-1)
    file_title = "".join(file_data)

    file_db = BaseFileCreate(title=file_title, type=file_type)
    
    file_fields = await FileModel.create(file_db)

    try:
        file_directory = settings.DATA_PATH
        if not path.exists(file_directory):
            makedirs(file_directory)
        file.filename = f"{str(uuid_.uuid4())}.{file_fields.type}"
        f = await run_in_threadpool(open, f"{file_directory}/{file.filename}", "wb")
        await run_in_threadpool(shutil.copyfileobj, file.file, f)
    except Exception():
        raise HTTPException(status_code=400, detail="Unable to write file")
    finally:
        if 'f' in locals(): await run_in_threadpool(f.close)
        await file.close()

    file_fields.path = f"{file_directory}/{file.filename}"
    await file_fields.save()

    return file_fields


@router.get("/{uuid}", response_class=FileResponse, status_code=200)
async def get_file(
    uuid: UUID4,
    current_user: User = Depends(get_current_admin)
):
    file_fields = await FileModel.get_or_none(uuid=uuid)

    if not file_fields:
        raise HTTPException(status_code=404, detail="The file with this uuid does not exist")

    media_type = ""

    for keys, values in settings.MEDIA_TYPES.items():
        if file_fields.type in values:
            media_type = keys

    if media_type == "":
        media_type = "application"

    return FileResponse(
        file_fields.path,
        media_type="application",
        filename=f"{file_fields.title}.{file_fields.type}"
    )