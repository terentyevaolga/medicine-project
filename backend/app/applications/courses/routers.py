import codecs
import json
from typing import List
from datetime import datetime, timedelta, date

from pydantic import UUID4
from fastapi import APIRouter, Depends, HTTPException, File
from fastapi.responses import FileResponse
from tortoise.expressions import Q

from app.core.auth.utils.contrib import get_current_user, get_current_admin
from app.applications.users.models import User
from app.applications.courses.models import Course, Theme, Part, Source, Test, TestResults, FileSource, ArticleSource
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
    TestResults as TestResultsModel,
    TestResultsCreate,
    BaseFileSourceOut,
    CourseLectionsPage,
    ThemeLectionsPage,
    PartLectionsPage,
    CourseSourcesPage,
    ThemeSourcesPage,
    PartSourcesPage,
    CourseLectionsPageLite,
    CourseSourcesPageLite,
    SourceFileOutLite,
    LectionOutLite,
    CourseArticlesPageLite,
    ArticleOutLite,
    RecsForPart,
    RecsWithPriority
)
from app.applications.courses.utils import check_answer
from app.applications.files.models import File as FileModel

from app.settings.config import settings


router = APIRouter()


@router.get("/", response_model=List[CourseWithParticipants], status_code=200)
async def get_page_courses_info(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        themes = await Theme.filter(course=course)
        themes_out = []
        for theme in themes:
            parts = await Part.filter(theme=theme)
            parts_out = []
            for part in parts:
                sources = await Source.filter(part=part)
                file_sources = await FileSource.filter(part=part)
                tests = await Test.filter(part=part).first()
                sources_out = [BaseSourceOut(**(await source.to_dict())) for source in sources]
                file_sources_out = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in file_sources]
                tests_out = BaseTestOut(**(await tests.to_dict())) if tests else None
                part_out = PartWithParticipants(uuid=part.uuid, title=part.title, sources=sources_out, tests=tests_out, file_sources=file_sources_out)
                parts_out.append(part_out)
            theme_out = ThemeWithParticipants(uuid=theme.uuid, title=theme.title, parts=parts_out)
            themes_out.append(theme_out)
        course_out = CourseWithParticipants(uuid=course.uuid, title=course.title, themes=themes_out)
        courses_out.append(course_out)
    return courses_out


@router.get("/video_materials", response_model=List[CourseLectionsPage], status_code=200)
async def get_page_lections_info(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        themes = await Theme.filter(course=course)
        themes_out = []
        for theme in themes:
            parts = await Part.filter(theme=theme)
            parts_out = []
            for part in parts:
                sources = await Source.filter(part=part)
                sources_out = [BaseSourceOut(**(await source.to_dict())) for source in sources]
                part_out = PartLectionsPage(uuid=part.uuid, title=part.title, sources=sources_out)
                parts_out.append(part_out)
            theme_out = ThemeLectionsPage(uuid=theme.uuid, title=theme.title, parts=parts_out)
            themes_out.append(theme_out)
        course_out = CourseLectionsPage(uuid=course.uuid, title=course.title, themes=themes_out)
        courses_out.append(course_out)
    return courses_out


@router.get("/video_materials_lite/", response_model=List[CourseLectionsPageLite], status_code=200)
async def get_lections_page_lite(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        lectinos_for_course = []
        themes = await Theme.filter(course=course)
        for theme in themes:
            parts = await Part.filter(theme=theme)
            for part in parts:
                lections = await Source.filter(part=part)
                # file_sources_out = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in file_sources]
                lections_out = [LectionOutLite(uuid=source.uuid, link=source.link) for source in lections]
                lectinos_for_course.extend(lections_out)
        course_out = CourseLectionsPageLite(lections=lectinos_for_course)
        courses_out.append(course_out)
    return courses_out


@router.get("/articles", response_model=List[CourseLectionsPage], status_code=200)
async def get_articles(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        themes = await Theme.filter(course=course)
        themes_out = []
        for theme in themes:
            parts = await Part.filter(theme=theme)
            parts_out = []
            for part in parts:
                sources = await ArticleSource.filter(part=part)
                sources_out = [BaseSourceOut(**(await source.to_dict())) for source in sources]
                part_out = PartLectionsPage(uuid=part.uuid, title=part.title, sources=sources_out)
                parts_out.append(part_out)
            theme_out = ThemeLectionsPage(uuid=theme.uuid, title=theme.title, parts=parts_out)
            themes_out.append(theme_out)
        course_out = CourseLectionsPage(uuid=course.uuid, title=course.title, themes=themes_out)
        courses_out.append(course_out)
    return courses_out


@router.get("/articles-lite", response_model=List[CourseArticlesPageLite], status_code=200)
async def get_articles_lite(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        lectinos_for_course = []
        themes = await Theme.filter(course=course)
        for theme in themes:
            parts = await Part.filter(theme=theme)
            for part in parts:
                lections = await ArticleSource.filter(part=part)
                # file_sources_out = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in file_sources]
                lections_out = [ArticleOutLite(uuid=source.uuid, title=source.title, link=source.link) for source in lections]
                lectinos_for_course.extend(lections_out)
        course_out = CourseArticlesPageLite(articles=lectinos_for_course)
        courses_out.append(course_out)
    return courses_out


@router.get("/file_sources", response_model=List[CourseSourcesPage], status_code=200)
async def get_page_file_sources_info(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        themes = await Theme.filter(course=course)
        themes_out = []
        for theme in themes:
            parts = await Part.filter(theme=theme)
            parts_out = []
            for part in parts:
                file_sources = await FileSource.filter(part=part)
                file_sources_out = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in file_sources]
                part_out = PartSourcesPage(uuid=part.uuid, title=part.title, sources=file_sources_out)
                parts_out.append(part_out)
            theme_out = ThemeSourcesPage(uuid=theme.uuid, title=theme.title, parts=parts_out)
            themes_out.append(theme_out)
        course_out = CourseSourcesPage(uuid=course.uuid, title=course.title, themes=themes_out)
        courses_out.append(course_out)
    return courses_out


@router.get("/file_sources_lite", response_model=List[CourseSourcesPageLite], status_code=200)
async def get_file_sources_lite(
    current_user: User = Depends(get_current_user)
):
    courses = await Course.all()
    courses_out = []
    for course in courses:
        course_manuals = []
        course_summaries = []
        course_articles = []
        themes = await Theme.filter(course=course)
        for theme in themes:
            parts = await Part.filter(theme=theme)
            for part in parts:
                file_manuals = await FileSource.filter(part=part, type="manual")
                file_summaries = await FileSource.filter(part=part, type="summary")
                file_artictes = await FileSource.filter(part=part, type="article")
                file_manuals_out = [SourceFileOutLite(uuid=file.uuid, title=file.title) for file in file_manuals]
                file_summaries_out = [SourceFileOutLite(uuid=file.uuid, title=file.title) for file in file_summaries]
                file_artictes_out = [SourceFileOutLite(uuid=file.uuid, title=file.title) for file in file_artictes]
                course_manuals.extend(file_manuals_out)
                course_summaries.extend(file_summaries_out)
                course_articles.extend(file_artictes_out)
        course_out = CourseSourcesPageLite(summaries=course_summaries, manuals=course_manuals, articles=course_articles)
        courses_out.append(course_out)
    return courses_out


@router.get("/file_sources/{uuid}", response_class=FileResponse, status_code=200)
async def get_file_resource(
    uuid: UUID4,
    current_user: User = Depends(get_current_user)
):
    resource = await FileSource.get_by_uuid(uuid=uuid)
    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="The source with this uuid does not exist"
        )

    file = await FileModel.get_by_uuid(uuid=resource.file_id)
    if file is None:
        raise HTTPException(
            status_code=404,
            detail="The file with this uuid does not exist"
        )

    media_type = ""

    for keys, values in settings.MEDIA_TYPES.items():
        if file.type in values:
            media_type = keys

    if media_type == "":
        media_type = "application"

    return FileResponse(
        file.path,
        headers={
            "content-type": f"{media_type}/{file.type}"
        },
        media_type="application",
        filename=f"{resource.title}.{file.type}"
    )    


@router.get("/source/{uuid}", response_model=BaseSourceOut, status_code=200)
async def get_source(
    uuid: UUID4,
    current_user: User = Depends(get_current_user)
):
    source = await Source.get_by_uuid(uuid=uuid)
    return source


@router.get("/test/{uuid}", response_model=TestOut, status_code=200)
async def get_test(
    uuid: UUID4,
    current_user: User = Depends(get_current_user)
):
    test = await Test.get_by_uuid(uuid=uuid)
    file = await FileModel.get_by_uuid(uuid=test.file_id)
    test_file = await FileModel.get_by_uuid(uuid=file.uuid)
    with codecs.open(test_file.path, "r", encoding="utf-8") as f:
        test_questions = json.load(f)
    test_out = TestOut(uuid=test.uuid, title=test.title, part_id=test.part_id, questions=test_questions["questions"])
    return test_out


@router.post("/test/check/", response_model=TestCheckOut, status_code=200)
async def check_test_answers(
    test_in: TestCheckIn,
    current_user: User = Depends(get_current_user)
):
    test = await Test.get_by_uuid(uuid=test_in.uuid)
    file = await FileModel.get_by_uuid(uuid=test.file_id)
    test_file = await FileModel.get_by_uuid(uuid=file.uuid)
    with codecs.open(test_file.path, "r", encoding="utf-8") as f:
        test_questions = json.load(f)
    test_answers = test_in.model_dump(exclude=["uuid"])["answers"]
    score = 0
    total = 0
    incorrect = []
    for answer in test_answers:
        if check_answer(test_questions=test_questions["questions"], answer=answer):
            score += 1
        else:
            for question_data in test_questions["questions"]:
                if question_data["text"] == answer["text"]:
                    answers = question_data["answers"]
                    right_answer = question_data["right_answers"]
                    question = IncorrectQuestionData(text=answer["text"], answers=answers, right_answers=right_answer, user_answers=answer["answers"])
                    incorrect.append(question)
        total += 1
    check_out = TestCheckOut(uuid=test.uuid, score=score, questions_number=total, incorrect_answers=incorrect)
    results_model = TestResultsCreate(user_id=current_user.uuid, test_id=test.uuid, score=score, questions_number=total, date=date.today())
    await TestResults.create(test=results_model)
    return check_out


@router.get("/tests_results", response_model=List[TestResultsModel], status_code=200)
async def get_user_tests_results(
    current_user: User = Depends(get_current_user)
):
    out = []
    tests = await TestResults.filter(user=current_user)
    for test in tests:
        test_model = await Test.get_by_uuid(uuid=test.test_id)
        out.append(TestResultsModel(user_id=current_user.uuid, 
                            test_id=test.test_id, 
                            test_title=test_model.title, 
                            score=test.score, 
                            questions_number=test.questions_number, 
                            date=test.date))
    return out


@router.get("/test/recommendations/{part_title}", response_model=RecsForPart, status_code=200)
async def get_recommendations_after_test(
    part_title: str,
    current_user: User = Depends(get_current_user)
):
    part = await Part.get_by_title(title=part_title)
    lections = [BaseSourceOut(**(await lection.to_dict())) for lection in await Source.filter(part=part)]
    file_sources = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in await FileSource.filter(part=part)]
    articles = [BaseSourceOut(**(await article.to_dict())) for article in await ArticleSource.filter(part=part)]
    recs_part = RecsForPart(lections=lections, file_sources=file_sources, articles=articles)
    return recs_part


@router.get("/recommendations", response_model=List[RecsForPart], status_code=200)
async def get_recommendations_based_on_tests(
    current_user: User = Depends(get_current_user)
):
    parts_out = []
    failed_tests = await TestResults.filter(Q(user=current_user) & Q(percentage__lt=75))
    for failed_test in failed_tests:
        passed_tests = await TestResults.filter(Q(user=current_user) & Q(percentage__gt=75) & Q(test_id=failed_test.test_id))
        if passed_tests == []:
            test = await Test.get_by_uuid(uuid=failed_test.test_id)
            part = await Part.get_by_uuid(uuid=test.part_id)
            parts_out.append(part)

    recs_out = []
    for part in parts_out:
        lections = [BaseSourceOut(**(await lection.to_dict())) for lection in await Source.filter(part=part)]
        file_sources = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in await FileSource.filter(part=part)]
        articles = [BaseSourceOut(**(await article.to_dict())) for article in await ArticleSource.filter(part=part)]
        recs_part = RecsForPart(lections=lections, file_sources=file_sources, articles=articles)
        recs_out.append(recs_part)
    
    return recs_out


@router.get("/recs", response_model=List[RecsWithPriority], status_code=200)
async def get_new_recommendations(
    current_user: User = Depends(get_current_user)
):
    parts_out = []
    priority_value = 1
    failed_tests = await TestResults.filter(Q(user=current_user) & Q(percentage__lt=85)).order_by("percentage")
    for failed_test in failed_tests:
        passed_tests = await TestResults.filter(Q(user=current_user) & Q(percentage__gt=75) & Q(test_id=failed_test.test_id))
        if passed_tests == []:
            test = await Test.get_by_uuid(uuid=failed_test.test_id)
            part = await Part.get_by_uuid(uuid=test.part_id)
            parts_out.append([part, priority_value])
            priority_value += 1

    recs_out = []
    for part_with_priority in parts_out:
        part = part_with_priority[0]
        priority = part_with_priority[1]
        lections = [BaseSourceOut(**(await lection.to_dict())) for lection in await Source.filter(part=part)]
        file_sources = [BaseFileSourceOut(**(await file_source.to_dict())) for file_source in await FileSource.filter(part=part)]
        articles = [BaseSourceOut(**(await article.to_dict())) for article in await ArticleSource.filter(part=part)]
        recs_part = RecsWithPriority(lections=lections, file_sources=file_sources, articles=articles, priority=priority)
        recs_out.append(recs_part)

    return recs_out