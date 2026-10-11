# Feature: Project Overview

**App:** The Enchanted Forest
**Type:** Full-stack web application
**Purpose:** Two AI agents (Luna and Oak) collaboratively tell a story in real time that ends in exactly 15 sentences. The user can pause, resume, and redirect the story at any point.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS with TypeScript, port 3001 |
| Frontend | React with TypeScript, Vite, port 5173 |
| AI | Groq API — `llama-3.3-70b-versatile` via `groq-sdk` |
| Real-time | Server-Sent Events (SSE) |
| Styling | Tailwind CSS |
| State | In-memory on backend (`Map` of sessions) — no database |

---

## Architecture

```
Browser (React)
    │  POST /story/start          → returns { sessionId }
    │  GET  /story/stream/:id     → SSE stream (stays open until complete/reset)
    │  POST /story/pause/:id
    │  POST /story/resume/:id
    │  POST /story/redirect/:id   → body: { message }
    │  GET  /story/status/:id     → returns { sessionId, currentTurn, isPaused, isComplete }
    └──────────────────────────────────────────────────────
NestJS
  StoryController
    └── StoryService
          ├── StorySession (per-session state)
          └── AgentsService → Groq API
```

Vite proxies `/story/*` → `http://localhost:3001/story`, eliminating CORS.

---

## File Structure

```
specDrivenDevelopmentMultiAgents/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── types/
│   │   │   └── story.types.ts
│   │   └── story/
│   │       ├── story.session.ts
│   │       ├── agents.service.ts
│   │       ├── story.service.ts
│   │       └── story.controller.ts
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── types/
    │   │   └── story.types.ts
    │   ├── hooks/
    │   │   └── useStory.ts
    │   ├── components/
    │   │   ├── ProgressBar.tsx
    │   │   ├── ChatBubble.tsx
    │   │   ├── StoryDisplay.tsx
    │   │   ├── RedirectInput.tsx
    │   │   └── Controls.tsx
    │   └── App.tsx
    ├── vite.config.ts
    └── package.json
```

---

## Running the App

```bash
# Backend
cd backend
npm install
npm run start:dev   # http://localhost:3001

# Frontend
cd frontend
npm install
npm run dev         # http://localhost:5173
```

---

## Backend Dependencies

```
@nestjs/common, @nestjs/core, @nestjs/platform-express
@nestjs/mapped-types
rxjs
groq-sdk
dotenv
reflect-metadata
```

## Frontend Dependencies

```
react, react-dom
typescript
vite, @vitejs/plugin-react
tailwindcss, autoprefixer, postcss
@types/react, @types/react-dom
```

---

## Environment

Backend `.env`:
```
GROQ_API_KEY=your_key_here
```
