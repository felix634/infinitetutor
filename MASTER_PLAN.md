# MASTER PLAN: The Infinite Tutor

## 1. Project Vision
A premium, AI-native learning platform that generates bespoke, interactive curricula for any niche topic. The app focuses on "Just-In-Time" (JIT) content generation, dynamic visualizations (Mermaid.js), and personalized learning paths based on user level and time commitment.

## 2. Technical Stack
*   **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion (Animations), Lucide React (Icons), Shadcn/UI (Components).
*   **Backend**: FastAPI (Python 3.10+), Pydantic v2, SQLAlchemy/PostgreSQL (Supabase), OpenAI SDK.
*   **Shared**: OpenAPI Specification (`openapi.json`) for contract-first development.
*   **DevOps**: Docker (optional), GitHub Actions for CI.

## 3. Core Architecture
### A. The "Tiered" Generation Engine
1.  **Phase 1 (Syllabus)**: Instant generation of chapters and lesson titles.
2.  **Phase 2 (Content)**: Streaming lesson content, AI-generated analogies, and Mermaid.js diagrams.
3.  **Phase 3 (Evaluation)**: Context-aware quizzes and logic-check diagrams.

### B. Directory Structure
```text
/
├── frontend/             # Next.js Application
├── backend/              # FastAPI Application
├── shared/               # API Specs and Prompt Templates
├── tests/                # Playwright E2E Tests
├── MASTER_PLAN.md        # This file
└── project_rules.md      # Shared coding standards
```

## 4. Phase 1 Roadmap (MVP)
*   **Milestone 1**: Landing Page & Intake Wizard (Frontend) + Syllabus Generation Endpoint (Backend).
*   **Milestone 2**: Course Dashboard & Lesson Viewer (Frontend) + Lesson Content & Diagram Generation (Backend).
*   **Milestone 3**: User Persistence (Auth) & Progress Tracking.

## 5. Current Task Board
| Task ID | Component | Description | Assigned To | Status |
| :--- | :--- | :--- | :--- | :--- |
| T1 | Shared | Initialize `openapi.json` and Shared Rules | Architect | Done |
| T2 | Frontend | Scaffold Next.js with Landing & Intake Wizard | Frontend Agent | Done |
| T3 | Backend | Scaffold FastAPI with Gemini Integration | Backend Agent | Done |
| T4 | QA | Setup Playwright and Smoke Tests | QA Agent | Pending |
| T5 | Full Stack | Interactive Quizzes (Gemini + UI) | Architect | Done |
| T6 | Full Stack | Multi-modal Lessons (Text + Diagrams + Progress) | Architect | Done |
