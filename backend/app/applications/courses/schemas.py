import uuid
from typing import Optional, List
from datetime import date

from pydantic import BaseModel, UUID4, validator
from fastapi import Form


class BaseProperties(BaseModel):
    @validator("uuid", pre=True, always=True, check_fields=False)
    def default_hashed_id(cls, v):
        return v or uuid.uuid4()
    

class BaseCourse(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None


class BaseCourseCreate(BaseProperties):
    title: str


class BaseCourseOut(BaseCourse):
    uuid: UUID4
    title: str


class BaseTheme(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None
    course_id: Optional[UUID4] = None


class BaseThemeCreate(BaseProperties):
    title: str
    course_id: UUID4


class BaseThemeOut(BaseTheme):
    uuid: UUID4
    title: str
    course_id: UUID4


class BasePart(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None
    theme_id: Optional[UUID4] = None


class BasePartCreate(BaseProperties):
    title: str
    theme_id: UUID4


class BasePartOut(BasePart):
    uuid: UUID4
    title: str
    theme_id: UUID4


class BaseSource(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None
    link: Optional[str] = None
    part_id: Optional[UUID4] = None


class BaseSourceCreate(BaseProperties):
    title: str
    link: str
    part_id: UUID4


class SourceCreateAdmin(BaseProperties):
    title: str
    link: str
    part_title: str


class SourceCreateText(BaseProperties):
    course_text: str
    theme_text: str
    part_text: str
    title: str
    link: str



class BaseSourceOut(BaseSource):
    uuid: UUID4
    title: str
    link: str
    part_id: UUID4


class BaseTest(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None
    part_id: Optional[UUID4] = None
    file_id: Optional[UUID4] = None


class BaseTestCreate(BaseProperties):
    title: str
    part_id: UUID4
    file_id: UUID4


class BaseTestOut(BaseTest):
    uuid: UUID4
    title: str
    part_id: UUID4
    file_id: UUID4


class BaseFileSource(BaseProperties):
    uuid: Optional[UUID4] = None
    title: Optional[str] = None
    type: Optional[str] = None
    part_id: Optional[UUID4] = None
    file_id: Optional[UUID4] = None


class BaseFileSourceCreate(BaseProperties):
    title: str
    type: str
    part_id: UUID4

    @classmethod
    def as_form(
        cls,
        type: str = Form(...),
        title: str = Form(...),
        part_id: UUID4 = Form(...)
    ):  
        return cls(title=title, type=type, part_id=part_id)
    

class FileSourceCreateAdmin(BaseProperties):
    title: str
    type: str
    part_title: str

    @classmethod
    def as_form(
        cls,
        type: str = Form(...),
        title: str = Form(...),
        part_title: str = Form(...)
    ):
        return cls(title=title, type=type, part_title=part_title)


class BaseFileSourceOut(BaseFileSource):
    uuid: UUID4
    title: str
    type: Optional[str] = None
    part_id: UUID4
    file_id: UUID4


class PartWithParticipants(BaseProperties):
    uuid: UUID4
    title: str
    sources: List[BaseSourceOut]
    file_sources: List[BaseFileSourceOut]
    tests: Optional[BaseTestOut] = None


class ThemeWithParticipants(BaseProperties):
    uuid: UUID4
    title: str
    parts: List[PartWithParticipants]


class CourseWithParticipants(BaseProperties):
    uuid: UUID4
    title: str
    themes: List[ThemeWithParticipants]


class PartLectionsPage(BaseProperties):
    uuid: UUID4
    title: str
    sources: List[BaseSourceOut]


class ThemeLectionsPage(BaseProperties):
    uuid: UUID4
    title: str
    parts: List[PartLectionsPage]


class CourseLectionsPage(BaseProperties):
    uuid: UUID4
    title: str
    themes: List[ThemeLectionsPage]


class LectionOutLite(BaseProperties):
    uuid: UUID4
    link: str


class CourseLectionsPageLite(BaseProperties):
    lections: List[LectionOutLite]


class ArticleOutLite(BaseProperties):
    uuid: UUID4
    title: str
    link: str


class CourseArticlesPageLite(BaseProperties):
    articles: List[ArticleOutLite]


class PartSourcesPage(BaseProperties):
    uuid: UUID4
    title: str
    sources: List[BaseFileSourceOut]


class ThemeSourcesPage(BaseProperties):
    uuid: UUID4
    title: str
    parts: List[PartSourcesPage]


class CourseSourcesPage(BaseProperties):
    uuid: UUID4
    title: str
    themes: List[ThemeSourcesPage]


class SourceFileOutLite(BaseProperties):
    uuid: UUID4
    title: str


class CourseSourcesPageLite(BaseProperties):
    summaries: List[SourceFileOutLite]
    manuals: List[SourceFileOutLite]
    articles: List[SourceFileOutLite]


class QuestionData(BaseProperties):
    text: str
    answers: List[str]
    right_answers: List[str]


class IncorrectQuestionData(BaseProperties):
    text: str
    answers: List[str]
    right_answers: List[str]
    user_answers: List[str]


class AnswerQuestion(BaseProperties):
    text: str
    answers: List[str]


class TestQuestionsCreate(BaseProperties):
    title: str
    part_id: UUID4
    questions: List[QuestionData]


class TestOut(TestQuestionsCreate):
    uuid: UUID4


class TestCheckOut(BaseProperties):
    uuid: UUID4
    score: int
    questions_number: int
    incorrect_answers: List[IncorrectQuestionData]


class TestCheckIn(BaseProperties):
    uuid: UUID4
    answers: List[AnswerQuestion]


class TestResultsCreate(BaseProperties):
    user_id: UUID4
    test_id: UUID4
    score: int
    questions_number: int
    date: date


class TestResults(BaseProperties):
    user_id: UUID4
    test_id: UUID4
    test_title: str
    score: int
    questions_number: int
    date: date


class RecsForPart(BaseProperties):
    lections: List[BaseSourceOut]
    file_sources: List[BaseFileSourceOut]
    articles: List[BaseSourceOut]


class RecsWithPriority(BaseProperties):
    lections: List[BaseSourceOut]
    file_sources: List[BaseFileSourceOut]
    articles: List[BaseSourceOut]
    priority: int
