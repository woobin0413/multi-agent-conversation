# Feature: Shared Types

**Files:**
- `backend/src/types/story.types.ts`
- `frontend/src/types/story.types.ts`

Both files are identical. Copy the same content to both locations.

---

## Types

```ts
export interface StoryEvent {
  turn: number        // current sentence number (1–15)
  total: number       // always 15
  character: 'Luna' | 'Oak'
  color: string       // text color hex
  bgColor: string     // bubble background color hex
  text: string        // the sentence spoken this turn
  isFinal: boolean    // true on turn 15 — signals story completion
}

export interface StoryStatus {
  sessionId: string
  currentTurn: number
  isPaused: boolean
  isComplete: boolean
}

export interface RedirectPayload {
  message: string
}
```

---

## Notes

- `StoryEvent.isFinal` is the sole signal for story completion. No separate event type is used.
- `StoryStatus` is returned by `GET /story/status/:sessionId`.
- `RedirectPayload` is the request body for `POST /story/redirect/:sessionId`.
