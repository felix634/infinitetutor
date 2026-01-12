from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyEmail(BaseModel):
    email: EmailStr
    code: str

class UserResponse(BaseModel):
    id: str
    email: str
    is_verified: bool
    created_at: datetime

class CourseProgress(BaseModel):
    course_id: str
    title: str
    topic: str
    level: str
    progress_percent: int
    last_accessed: datetime

class UserDashboard(BaseModel):
    user: UserResponse
    courses: List[CourseProgress]
    suggestions: List[dict]
