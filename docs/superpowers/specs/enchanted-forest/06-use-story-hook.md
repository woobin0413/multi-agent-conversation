# Feature: useStory Hook

**File:** `frontend/src/hooks/useStory.ts`

Custom React hook. Single source of truth for all story state and API interactions. Owns the `EventSource` lifecycle.

---

## Vite Proxy

Configure in `vite.config.ts`:
```ts
server: {
  proxy: {
    '/story': 'http://localhost:3001'
  }
}
```
All API calls use relative paths (e.g. `/story/start`) — Vite proxies them to NestJS.

---

## State

| Field | Type | Initial Value |
|---|---|---|
| `sessionId` | `string \| null` | `null` |
| `sentences` | `StoryEvent[]` | `[]` |
| `isPaused` | `boolean` | `false` |
| `isComplete` | `boolean` | `false` |
| `currentTurn` | `number` | `0` |
| `status` | `string` | `'Ready to begin'` |
| `eventSource` | `EventSource \| null` | `null` (ref, not state) |

---

## Methods

### `startStory(): Promise<void>`
1. `POST /story/start` → get `sessionId`
2. Reset state: clear `sentences`, set `isComplete = false`, `isPaused = false`, `currentTurn = 0`
3. Open `new EventSource('/story/stream/${sessionId}')`
4. `eventSource.onmessage = (e) => {`
   - `data = JSON.parse(e.data)`
   - Append `data` to `sentences`
   - `setCurrentTurn(data.turn)`
   - `setStatus(`${data.character} is speaking...`)`
   - If `data.isFinal === true`:
     - `setIsComplete(true)`
     - `setStatus('The story is complete')`
     - `eventSource.close()`
5. `eventSource.onerror = () => {`
   - `setStatus('Connection lost')`
   - `eventSource.close()`

---

### `pauseStory(): Promise<void>`
1. `POST /story/pause/${sessionId}`
2. `setIsPaused(true)`
3. `setStatus('Paused')`
4. **Do not close or reopen EventSource** — SSE connection stays open

---

### `resumeStory(): Promise<void>`
1. `POST /story/resume/${sessionId}`
2. `setIsPaused(false)`
3. `setStatus('Resuming...')`
4. **Do not close or reopen EventSource** — existing connection continues receiving events automatically

---

### `redirectStory(message: string): Promise<void>`
1. `POST /story/redirect/${sessionId}` with body `{ message }`
2. `setStatus('Redirect queued for next turn')`

---

### `resetStory(): void`
1. Close `eventSource` if open
2. Clear all state to initial values
3. `setStatus('Ready to begin')`

---

## Return Value

Return all state fields and all methods so components can destructure what they need.

---

## Derived State (compute in hook, expose as return values)

```ts
const hasStarted = sessionId !== null
```
