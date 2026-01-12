# InfiniteTutor 🎓

AI-powered personalized learning platform that generates custom curricula on any topic.

## Features

- 🧠 **AI-Generated Curricula** - Enter any topic and get a structured learning path
- 📚 **Interactive Lessons** - Rich content with Mermaid.js diagrams
- ✅ **Knowledge Quizzes** - Test your understanding after each lesson
- 🏆 **Achievements & Badges** - Earn titles like "Expert Mathematician"
- 🔐 **User Authentication** - Secure login with email verification
- 📊 **Progress Tracking** - Resume courses from where you left off

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React Icons

### Backend
- FastAPI (Python)
- SQLite Database
- Gemini AI API
- Resend Email API

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Gemini API Key

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:
```env
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key  # Optional
FROM_EMAIL=onboarding@resend.dev
```

Run the backend:
```bash
python -m uvicorn main:app --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Frontend (Netlify)
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables: Set `NEXT_PUBLIC_API_URL` to your backend URL

### Backend
Deploy to Railway, Render, or any Python hosting platform.

## License

MIT
