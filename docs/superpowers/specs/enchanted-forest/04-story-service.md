# Feature: StoryService

**File:** `backend/src/story/story.service.ts`

Injectable NestJS service. Owns the session map and drives the story generation loop.

---

## Dependencies

- Inject `AgentsService`
- Private field: `sessions = new Map<string, StorySession>()`

---

## Methods

### `createSession(): StorySession`
- Generate `sessionId` with `crypto.randomUUID()`
- Create `new StorySession(sessionId)`
- Store in `sessions` map
- Return the session

### `getSession(sessionId: string): StorySession`
- Return `sessions.get(sessionId)`
- Throw `NotFoundException` if not found

### `pauseSession(sessionId: string): void`
- Get session, set `session.isPaused = true`

### `resumeSession(sessionId: string): void`
- Get session, set `session.isPaused = false`

### `redirectSession(sessionId: string, message: string): void`
- Get session, call `session.injectRedirect(message)`

---

## Method: `streamStory`

```ts
async *streamStory(sessionId: string): AsyncGenerator<StoryEvent>
```

### Opening context
Before the loop, add to session history:
```ts
{ role: 'user', content: 'The story begins. Luna has just stepped into the enchanted forest and notices a massive ancient tree with a face in its bark. Begin the story.' }
```

### Loop (turn 1 to 15)

```
session.incrementTurn()
character = session.getNextCharacter()
redirect = session.consumeRedirect()

while session.isPaused:
  await sleep(300ms)       ← keeps SSE connection alive, no data emitted

line = await agentsService.callAgent(character, session.history, turn, redirect)
session.addToHistory(character, line)

yield {
  turn,
  total: 15,
  character,
  color: character === 'Luna' ? '#3C3489' : '#27500A',
  bgColor: character === 'Luna' ? '#EEEDFE' : '#EAF3DE',
  text: line,
  isFinal: turn === 15
}

await sleep(600ms)         ← pacing between turns
```

After the loop completes:
```ts
session.isComplete = true
```

---

## Pause/Resume Behaviour

The SSE connection remains open during pause. The `while (isPaused)` loop keeps the async generator alive without emitting events. When `isPaused` is set to `false` (via `resumeSession`), the loop exits and generation continues from the exact turn it was on. No reconnection is needed.

---

## Helper

```ts
private sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```
