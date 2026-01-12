from pydantic import BaseModel
from typing import List

class QuizRequest(BaseModel):
    lesson_title: str
    topic: str
    level: str

class Question(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class QuizResponse(BaseModel):
    lesson_title: str
    questions: List[Question]
