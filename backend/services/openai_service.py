import os
import json
from openai import AsyncOpenAI
from typing import Dict, Any
from schemas.syllabus import SyllabusRequest, SyllabusResponse

api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    client = AsyncOpenAI(api_key=api_key)
else:
    client = None # type: ignore

async def generate_syllabus_content(request: SyllabusRequest) -> Dict[str, Any]:
    if not api_key:
        return {
            "course_id": "mock-course-123",
            "title": f"Mastery of {request.topic}",
            "chapters": [
                {
                    "id": "chap-1",
                    "title": "The First Principles",
                    "lessons": ["What is " + request.topic, "Foundations for " + request.level]
                },
                {
                    "id": "chap-2",
                    "title": "Diving Deeper",
                    "lessons": ["Advanced Concepts in " + request.topic, "Level: " + request.level]
                }
            ]
        }
    
    prompt = f"""
    Generate a high-end, premium syllabus for a course on '{request.topic}'.
    Level: {request.level}
    Daily Commitment: {request.daily_minutes} minutes
    
    CRITICAL INSTRUCTIONS:
    1. Chapter titles should be catchy, evocative, and professional (e.g., 'The Foundations of Mastery' instead of 'Introduction').
    2. Lesson names should be punchy, descriptive, and spark curiosity.
    3. The course title itself should be inspiring and relevant to the topic.
    4. The content must be strictly tailored to the '{request.level}' level.
    5. For {request.level} level, use appropriate terminology and complexity depths.
    
    Structure the response as JSON:
    {{
        "course_id": "unique_string_id",
        "title": "A Compelling and Premium Course Title",
        "chapters": [
            {{
                "id": "chap-1",
                "title": "Evocative Chapter Title",
                "lessons": ["Intriguing Lesson 1", "Mastery Lesson 2"]
            }}
        ]
    }}
    """

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a professional curriculum architect."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

