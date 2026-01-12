from pydantic import BaseModel

class DiagramRequest(BaseModel):
    lesson_title: str
    topic: str
    level: str

class DiagramResponse(BaseModel):
    lesson_title: str
    mermaid_code: str
    explanation: str
