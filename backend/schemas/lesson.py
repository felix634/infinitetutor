from pydantic import BaseModel
from typing import List, Optional

class LessonContentRequest(BaseModel):
    lesson_title: str
    topic: str
    level: str

class LessonContentResponse(BaseModel):
    lesson_title: str
    content_markdown: str
    mermaid_code: str
    image_prompt: str
    summary: str
