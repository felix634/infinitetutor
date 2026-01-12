import os
import uuid
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from schemas.syllabus import SyllabusRequest, SyllabusResponse
from schemas.quiz import QuizRequest, QuizResponse
from schemas.lesson import LessonContentRequest, LessonContentResponse
from schemas.diagram import DiagramRequest, DiagramResponse
from schemas.user import UserRegister, UserLogin, VerifyEmail, UserResponse, CourseProgress
from services.gemini_service import (
    generate_syllabus_content, 
    generate_quiz_content, 
    generate_diagram_content,
    generate_lesson_content,
    generate_course_suggestions
)
from services.auth_service import (
    register_user,
    verify_email,
    login_user,
    get_user_by_token,
    logout_user,
    save_user_course,
    get_user_courses,
    get_cached_lesson,
    save_cached_lesson
)
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="The Infinite Tutor API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; refine for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ============ AUTH ENDPOINTS ============

@app.post("/auth/register")
async def auth_register(request: UserRegister):
    success, message = register_user(request.email, request.password)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@app.post("/auth/login")
async def auth_login(request: UserLogin):
    success, message, token = login_user(request.email, request.password)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message, "token": token}

@app.post("/auth/verify")
async def auth_verify(request: VerifyEmail):
    success, message, token = verify_email(request.email, request.code)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message, "token": token}

@app.get("/auth/me")
async def auth_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "is_verified": user["is_verified"],
        "created_at": user["created_at"]
    }

@app.post("/auth/logout")
async def auth_logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        logout_user(token)
    return {"message": "Logged out successfully"}

# ============ USER COURSE ENDPOINTS ============

class SaveCourseRequest(BaseModel):
    course_id: str
    title: str
    topic: str
    level: str
    progress_percent: int = 0
    chapters: list = []

@app.post("/user/save-course")
async def save_course(request: SaveCourseRequest, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    save_user_course(user["email"], request.model_dump())
    return {"message": "Course saved successfully"}

@app.get("/user/courses")
async def get_courses(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    courses = get_user_courses(user["email"])
    return {"courses": courses}

@app.get("/user/course/{course_id}")
async def get_course(course_id: str, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    courses = get_user_courses(user["email"])
    course = next((c for c in courses if c.get("course_id") == course_id), None)
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course

@app.get("/user/suggestions")
async def get_suggestions(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    courses = get_user_courses(user["email"])
    topics = [c.get("topic", c.get("title", "")) for c in courses]
    
    try:
        suggestions = generate_course_suggestions(topics)
        return {"suggestions": suggestions}
    except Exception as e:
        return {"suggestions": [
            {"title": "History of Ancient Civilizations", "description": "Explore the rise and fall of great empires"},
            {"title": "Introduction to Data Science", "description": "Learn the fundamentals of data analysis"},
            {"title": "Creative Writing Masterclass", "description": "Develop your storytelling skills"}
        ]}

# ============ CONTENT GENERATION ENDPOINTS ============

@app.post("/generate-syllabus", response_model=SyllabusResponse)
async def generate_syllabus(request: SyllabusRequest):
    try:
        syllabus_data = generate_syllabus_content(request)
        
        # Ensure a unique ID if not generated by AI
        if "course_id" not in syllabus_data or not syllabus_data["course_id"]:
            syllabus_data["course_id"] = str(uuid.uuid4())
            
        return syllabus_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        quiz_data = generate_quiz_content(request)
        return quiz_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-diagram", response_model=DiagramResponse)
async def generate_diagram(request: DiagramRequest):
    try:
        diagram_data = generate_diagram_content(request)
        return diagram_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-lesson", response_model=LessonContentResponse)
async def generate_lesson(request: LessonContentRequest):
    try:
        # Check cache first if course_id is provided
        if request.course_id:
            cached = get_cached_lesson(request.course_id, request.lesson_title)
            if cached:
                print(f"✅ Returning cached lesson: {request.lesson_title}")
                return LessonContentResponse(
                    lesson_title=cached["lesson_title"],
                    content_markdown=cached["content_markdown"],
                    mermaid_code=cached.get("mermaid_code", ""),
                    image_prompt="",
                    summary=""
                )
        
        # Generate new lesson
        lesson_data = generate_lesson_content(request)
        
        # Cache the lesson if course_id is provided
        if request.course_id:
            save_cached_lesson(
                course_id=request.course_id,
                lesson_title=request.lesson_title,
                topic=request.topic,
                level=request.level,
                content_markdown=lesson_data.get("content_markdown", ""),
                mermaid_code=lesson_data.get("mermaid_code", ""),
                explanation=lesson_data.get("summary", "")
            )
            print(f"💾 Cached new lesson: {request.lesson_title}")
        
        return lesson_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
