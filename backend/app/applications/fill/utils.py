import json
import uuid
import codecs
import os

from fastapi.exceptions import HTTPException

from app.applications.courses.models import Test
from app.applications.courses.schemas import TestQuestionsCreate, BaseTestCreate
from app.applications.files.models import File
from app.applications.files.schemas import BaseFileCreate
from app.settings.config import settings

async def create_test(
    test_data: TestQuestionsCreate
):
    test_data_json = json.dumps(test_data.model_dump(exclude=["title", "part_id"]), ensure_ascii=True)
    try:
        file_path = f"{settings.DATA_PATH}/tests/{str(uuid.uuid4())}.json"
        if not os.path.exists(f"{settings.DATA_PATH}/tests/"):
            os.makedirs(f"{settings.DATA_PATH}/tests/")
        with codecs.open(file_path, "w", encoding="utf-8") as f:
            f.write(test_data_json)
        file_db = BaseFileCreate(title=test_data.title, type="json", path=file_path)
        file = await File.create(file=file_db)
    except Exception():
        raise HTTPException(status_code=400, detail="Unable to write file")
    test_db = BaseTestCreate(title=test_data.title, part_id=test_data.part_id, file_id=file.uuid)
    test = await Test.create(test=test_db)
    return test