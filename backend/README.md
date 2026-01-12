# The Infinite Tutor - Backend

This is the FastAPI backend for The Infinite Tutor.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables:
   Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.

3. Run the server:
   ```bash
   python main.py
   ```
   Or using uvicorn:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- `GET /health`: Health check.
- `POST /generate-syllabus`: Generate a course syllabus using AI.
