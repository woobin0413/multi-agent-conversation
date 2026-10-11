# Feature: StoryController

**File:** `backend/src/story/story.controller.ts`

Thin HTTP layer. Maps routes to `StoryService` calls. Controller prefix: `'story'`.

---

## Bootstrap (`main.ts`)

- Port: `3001`
- Enable CORS for `http://localhost:5173` (Vite dev server)

## Module (`app.module.ts`)

- Import `StoryModule`
- `StoryModule` provides `StoryController`, `StoryService`, `AgentsService`

---

## Routes

### `POST /story/start`
- Calls `storyService.createSession()`
- Returns `{ sessionId: string }`

---

### `GET /story/stream/:sessionId` — SSE Endpoint

- Use NestJS `@Sse()` decorator
- Return an `Observable` built from the async generator:

```ts
import { from } from 'rxjs'
import { Readable } from 'stream'

// Convert AsyncGenerator → Observable
const generator = this.storyService.streamStory(sessionId)
const readable = Readable.from(generator)
return from(readable).pipe(
  map(event => ({ data: event }))
)
```

Each emission must be wrapped: `{ data: storyEvent }`

The SSE connection stays open for the full story duration (all 15 turns + pause time). It closes naturally when the generator completes.

---

### `POST /story/pause/:sessionId`
- Calls `storyService.pauseSession(sessionId)`
- Returns `{ success: true }`

---

### `POST /story/resume/:sessionId`
- Calls `storyService.resumeSession(sessionId)`
- Returns `{ success: true }`

---

### `POST /story/redirect/:sessionId`
- Body: `RedirectPayload` (`{ message: string }`)
- Calls `storyService.redirectSession(sessionId, body.message)`
- Returns `{ success: true }`

---

### `GET /story/status/:sessionId`
- Returns `StoryStatus`:
```ts
{
  sessionId,
  currentTurn: session.currentTurn,
  isPaused: session.isPaused,
  isComplete: session.isComplete
}
```

---

## Error Responses

- Invalid `sessionId` on any route: `StoryService.getSession()` throws `NotFoundException` → NestJS returns HTTP 404 automatically
