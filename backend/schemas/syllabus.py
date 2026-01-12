from pydantic import BaseModel
from typing import List

class SyllabusRequest(BaseModel):
    topic: str
    level: str
    daily_minutes: int

class Lesson(BaseModel):
    title: str

class Chapter(BaseModel):
    id: str
    title: str
    lessons: List[str]

class SyllabusResponse(BaseModel):
    course_id: str
    title: str
    chapters: List[Chapter]
