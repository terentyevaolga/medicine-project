import codecs
import json
from typing import List
from datetime import datetime, timedelta

from pydantic import UUID4
from fastapi import APIRouter, Depends, HTTPException

from app.core.auth.utils.contrib import get_current_user, get_current_admin
from app.applications.users.models import User
from app.applications.courses.models import Course, Theme, Part, Source, Test
from app.applications.courses.schemas import (
    BaseCourseCreate,
    BaseCourseOut,
    BaseThemeCreate,
    BaseThemeOut,
    BasePartCreate,
    BasePartOut,
    BaseSourceCreate,
    BaseSourceOut,
    BaseTestCreate,
    BaseTestOut,
    CourseWithParticipants,
    ThemeWithParticipants,
    PartWithParticipants,
    TestOut,
    TestCheckOut,
    TestCheckIn,
    IncorrectQuestionData,
    TestQuestionsCreate,
    QuestionData
)
from app.applications.fill.utils import create_test
from app.applications.courses.utils import check_answer
from app.applications.files.models import File

from app.settings.config import settings


async def fill_themes():
    themes_list = [["Анатомия", "Физиология", "Биология", "Гистология", "Латынь",],
                   ["Топографическая анатомия", "Оперативная хирургия", "Биохимия", "Микробиология", "Гигиена"],
                   ["Иммунология", "Патфизиология", "Патанатомия", "Фармакология"],
                   ["Ортодонтия", "Хирургия", "Протезирование", "Детская стоматология"],
                   ["Терапевтическая стоматология", "Хирургическая стоматология", "Фармакология в стоматологии", "Стоматологическая реабилитация", "Эстетическая стоматология"]]
    
    for index, course in enumerate(themes_list):
        index += 1
        check = await Course.get_by_title(title=str(index))
        if check is not None:
            return
        course_model = BaseCourseCreate(title=str(index))
        course_db = await Course.create(course=course_model)
        for theme in course:
            theme_model = BaseThemeCreate(title=theme, course_id=course_db.uuid)
            await Theme.create(theme=theme_model)


async def fill_parts():
    with open("data/result.json", "r") as file:
        data = json.load(file)
    for course_data in data["courses"]:
        for theme in course_data["themes"]:
            theme_title = theme["theme"]
            theme_db = await Theme.get_by_title(title=theme_title)
            for part in theme["parts"]:
                part_model = BasePartCreate(title=part["title"], theme_id=theme_db.uuid)
                check = await Part.get_by_title(title=part["title"])
                if check:
                    return
                part_db = await Part.create(part=part_model)
                for lection in part["videolections"]:
                    source_model = BaseSourceCreate(title="Видеолекция", link=lection, part_id=part_db.uuid)
                    await Source.create(source=source_model)
                test_question_list = [QuestionData(text=question["question"], 
                                                   answers=question["variants"], 
                                                   right_answers=question["answers"]) for question in part["test"]]
                test_model = TestQuestionsCreate(title=part_db.title, part_id=part_db.uuid, questions=test_question_list)
                await create_test(test_data=test_model)
