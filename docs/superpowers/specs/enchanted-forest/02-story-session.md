# Feature: StorySession

**File:** `backend/src/story/story.session.ts`

Plain TypeScript class — no NestJS decorators, no framework dependencies. Holds all mutable state for one story run.

---

## Fields

| Field | Type | Initial Value | Description |
|---|---|---|---|
| `sessionId` | `string` | constructor arg | Unique identifier for this session |
| `history` | `Array<{ role: string, content: string }>` | `[]` | Conversation history passed to Groq |
| `currentTurn` | `number` | `0` | Incremented before each agent call |
| `isPaused` | `boolean` | `false` | Whether story generation is paused |
| `isComplete` | `boolean` | `false` | Set to true after turn 15 completes |
| `pendingRedirect` | `string \| null` | `null` | One-shot redirect message from user |

---

## Methods

### `constructor(sessionId: string)`
Initializes all fields with the values above.

### `getNextCharacter(): 'Luna' | 'Oak'`
- Returns `'Luna'` if `currentTurn` is **odd**
- Returns `'Oak'` if `currentTurn` is **even**
- Called after `incrementTurn()`, so turn 1 (odd) → Luna goes first

### `incrementTurn(): void`
```
currentTurn++
```

### `injectRedirect(message: string): void`
```
pendingRedirect = message
```

### `consumeRedirect(): string | null`
Returns `pendingRedirect`, then sets it to `null`. One-shot: calling it twice returns `null` the second time.

### `addToHistory(character: string, line: string): void`
Pushes to `history`:
```ts
{ role: 'assistant', content: `${character}: ${line}` }
```
