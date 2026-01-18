import os
import json
import google.generativeai as genai
from typing import Dict, Any
from schemas.syllabus import SyllabusRequest
from schemas.quiz import QuizRequest
from schemas.lesson import LessonContentRequest
from schemas.diagram import DiagramRequest

def generate_syllabus_content(request: SyllabusRequest) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback for development if no key is provided yet
        return {
            "course_id": "demo-mode",
            "title": f"Mastering {request.topic} (Demo)",
            "chapters": [
                {
                    "id": "chap-1",
                    "title": "Welcome to the Topic",
                    "lessons": ["Introduction", "Core Concepts"]
                }
            ]
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash') # Using flash for speed/cost
    
    prompt = f"""
    Generate a comprehensive and engaging syllabus for a course on '{request.topic}'.
    The user's experience level is '{request.level}'.
    They can commit {request.daily_minutes} minutes per day.
    
    The syllabus should be structured with interesting chapter titles and creative lesson names that reflect the {request.level} level.
    
    Return the response ONLY in a valid JSON format matching this structure:
    {{
        "course_id": "unique-id",
        "title": "A Great Course Title",
        "chapters": [
            {{
                "id": "chap-1",
                "title": "Chapter Title",
                "lessons": ["Lesson 1 Name", "Lesson 2 Name"]
            }}
        ]
    }}
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)

def generate_quiz_content(request: QuizRequest) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "lesson_title": request.lesson_title,
            "questions": [
                {
                    "question": f"Question {i+1} about {request.lesson_title}?",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "A",
                    "explanation": "This is a demo explanation."
                } for i in range(6)
            ]
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""
    Generate exactly 6 multiple choice questions for the lesson '{request.lesson_title}' 
    which is part of a course on '{request.topic}' at the '{request.level}' level.
    Each question must have exactly 4 options labeled A, B, C, and D.
    
    Return the response ONLY in a valid JSON format matching this structure:
    {{
        "lesson_title": "{request.lesson_title}",
        "questions": [
            {{
                "question": "The question text?",
                "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
                "correct_answer": "A. First option",
                "explanation": "Brief explanation of why this is correct."
            }}
        ]
    }}
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)

def generate_diagram_content(request: DiagramRequest) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "lesson_title": request.lesson_title,
            "mermaid_code": "graph TD\nA[Start] --> B(Process)\nB --> C{Decision}\nC -->|Yes| D[Result 1]\nC -->|No| E[Result 2]",
            "explanation": "This is a demo diagram explaining the process flow."
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""
    Generate a Mermaid.js diagram code that visualizes the core concept of the lesson '{request.lesson_title}' 
    which is part of a course on '{request.topic}' at the '{request.level}' level.
    
    The diagram should be clear, educational, and use appropriate Mermaid syntax (graph TD, sequenceDiagram, etc.).
    
    Return the response ONLY in a valid JSON format matching this structure:
    {{
        "lesson_title": "{request.lesson_title}",
        "mermaid_code": "graph TD\\n...",
        "explanation": "Brief explanation of what this diagram shows."
    }}
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)

def generate_lesson_content(request: LessonContentRequest) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "lesson_title": request.lesson_title,
            "content_markdown": f"# {request.lesson_title}\n\nThis is a comprehensive guide to understanding {request.lesson_title}. Imagine you are in a high-tech lab...\n\n### Key Concepts\n- Concept 1: Precision\n- Concept 2: Iteration",
            "mermaid_code": "graph LR\nA[Input] --> B[Processing] --> C[Output]",
            "image_prompt": f"A cinematic wide shot of a futuristic library representing {request.lesson_title}, 8k, minimalist dark theme.",
            "summary": "You've learned the basics of the topic."
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""
    Generate rich lesson content for '{request.lesson_title}' 
    as part of a course on '{request.topic}' at the '{request.level}' level.
    
    The content should include:
    1. A long, engaging guide in Markdown format.
    2. A Mermaid.js MINDMAP diagram (NOT flowchart) that visualizes the main concepts.
       - Use the mindmap syntax: mindmap
         root((Main Topic))
           Branch1
             Leaf1
             Leaf2
           Branch2
       - Keep labels SHORT (max 3-4 words)
       - Use emojis to make it visual (📚 🎯 💡 🔑 ⚡ 🌟 etc.)
       - Maximum 4 main branches, 2-3 leaves per branch
    3. A creative DALL-E/Stable Diffusion image prompt that fits the lesson theme.
    4. A 1-sentence summary.
    
    Return the response ONLY in a valid JSON format matching this structure:
    {{
        "lesson_title": "{request.lesson_title}",
        "content_markdown": "Markdown string here...",
        "mermaid_code": "mindmap\\n  root((Topic))\\n    Branch1\\n      Leaf1",
        "image_prompt": "Prompt here...",
        "summary": "Summary here."
    }}
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)

def generate_course_suggestions(user_topics: list) -> list:
    """Generate 3 course suggestions based on user's learning history."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not user_topics:
        return [
            {"title": "History of Ancient Civilizations", "description": "Explore the rise and fall of great empires"},
            {"title": "Introduction to Data Science", "description": "Learn the fundamentals of data analysis"},
            {"title": "Creative Writing Masterclass", "description": "Develop your storytelling skills"}
        ]
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    topics_str = ", ".join(user_topics[:5])  # Limit to 5 topics
    
    prompt = f"""
    Based on a user who has been learning about: {topics_str}
    
    Suggest 3 related but different course topics they might enjoy next.
    Each suggestion should be complementary to their interests but expand into new areas.
    
    Return the response ONLY in a valid JSON format matching this structure:
    {{
        "suggestions": [
            {{
                "title": "Course Title",
                "description": "A brief 1-sentence description of what they'll learn"
            }}
        ]
    }}
    """
    
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    data = json.loads(response.text)
    return data.get("suggestions", [])[:3]
