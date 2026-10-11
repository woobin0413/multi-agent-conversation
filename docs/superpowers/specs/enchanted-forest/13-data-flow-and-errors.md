# Feature: Data Flow & Error Handling

Cross-cutting reference. Describes the full request/event flows and error behaviour across all features.

---

## Happy Path

```
User clicks "Begin Story"
  → POST /story/start
  ← { sessionId }
  → EventSource('/story/stream/${sessionId}') opened
  ← StoryEvent { turn: 1, character: 'Luna', text: '...', isFinal: false }
  ← StoryEvent { turn: 2, character: 'Oak',  text: '...', isFinal: false }
  ...
  ← StoryEvent { turn: 15, character: 'Luna', text: '...', isFinal: true }
  → Frontend: setIsComplete(true), close EventSource, show "~ The End ~"
```

Pacing: 600ms between turns on the backend. Typewriter effect (80ms/word) on the frontend.

---

## Pause / Resume

```
User clicks "Pause"
  → POST /story/pause/${sessionId}
  ← { success: true }
  Backend: session.isPaused = true
           streamStory enters while(isPaused) sleep(300ms) loop
           SSE connection stays open — no events emitted

User clicks "Resume"
  → POST /story/resume/${sessionId}
  ← { success: true }
  Backend: session.isPaused = false
           while loop exits, generation continues
  Frontend: receives next sentence on the SAME EventSource connection
            (no reconnect, no new EventSource opened)
```

---

## Redirect

```
User types "make a dragon appear" and submits
  → POST /story/redirect/${sessionId}  body: { message: 'make a dragon appear' }
  ← { success: true }
  Backend: session.pendingRedirect = 'make a dragon appear'

Next turn:
  redirect = session.consumeRedirect()   → 'make a dragon appear'
  session.pendingRedirect = null         ← cleared; one-shot only
  AgentsService injects into Groq prompt:
    { role: 'user', content: 'Story change: make a dragon appear. Continue naturally.' }
  Story shifts at the next sentence naturally
```

---

## Error Scenarios

| Scenario | Backend behaviour | Frontend behaviour |
|---|---|---|
| Groq API call fails | Retry once after 1000ms | — |
| Groq API fails on retry | Throw error | `eventSource.onerror` fires → status "Connection lost", EventSource closed |
| Invalid `sessionId` | `NotFoundException` (HTTP 404) | API call rejected — show error status |
| SSE connection drops (network) | Generator continues until turn timeout | `eventSource.onerror` fires → status "Connection lost" |

---

## Completion Detection

Story completion is detected **entirely via `isFinal: true`** on the last `StoryEvent` (turn 15).

- No separate `story_complete` event is emitted
- No polling of `/story/status`
- When `isFinal` is received, the frontend closes the EventSource and transitions to the completed state
