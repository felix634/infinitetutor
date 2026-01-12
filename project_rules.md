# Project Rules: The Infinite Tutor

## General Standards
- **Contract First**: Always refer to `shared/openapi.json` before implementing endpoints.
- **Aesthetic Priority**: All UI must look premium. Use HSL colors, glassmorphism, and subtle transitions.
- **Error Handling**: Every AI call must have a fallback (e.g., "Retrying..." UI or cached mock data).

## Frontend Rules (Next.js)
- Use standard `c:\Users\local_user\antigravity\learning\frontend` for the root.
- Use `shadcn/ui` for base components.
- Use `framer-motion` for all entrance/exit animations.
- Icons: `lucide-react`.

## Backend Rules (FastAPI)
- Use `c:\Users\local_user\antigravity\learning\backend` for the root.
- Async endpoints by default.
- Pydantic for request/response validation.
- OpenAI logic must be modularized in `services/openai_service.py`.

## QA Rules
- End-to-end tests must cover the "Happy Path" of the Intake Wizard.
- Use Playwright.
