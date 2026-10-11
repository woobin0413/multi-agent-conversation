# Feature: AgentsService

**File:** `backend/src/story/agents.service.ts`

Injectable NestJS service. Stateless. Wraps the Groq SDK to call `llama-3.3-70b-versatile` for each story turn.

---

## Setup

- Import `Groq` from `'groq-sdk'`
- Read `GROQ_API_KEY` from `process.env`
- Instantiate `new Groq({ apiKey: process.env.GROQ_API_KEY })`

---

## Characters

### Luna
```ts
name: 'Luna'
color: '#3C3489'
bgColor: '#EEEDFE'
systemPrompt: `You are Luna, a curious young wizard exploring an enchanted
forest. You are speaking with Oak, an ancient talking tree. Speak ONE
sentence only per turn. Stay in character. React to what Oak just said.
Be vivid and expressive. Never write more than one sentence. No quotation
marks around your response.`
```

### Oak
```ts
name: 'Oak'
color: '#27500A'
bgColor: '#EAF3DE'
systemPrompt: `You are Oak, an ancient talking tree, 500 years old, wise,
slow, and mysterious. You are speaking with Luna, a young wizard who entered
your forest. Speak ONE sentence only per turn. Stay in character. React to
what Luna just said. Reveal forest secrets gradually. Never write more than
one sentence. No quotation marks around your response.`
```

---

## Method: `callAgent`

```ts
async callAgent(
  character: 'Luna' | 'Oak',
  history: Array<{ role: string, content: string }>,
  turn: number,
  redirect: string | null
): Promise<string>
```

### Step 1 — Build system prompt

Start with the character's base `systemPrompt`, then append closing cues:

```
if turn === 13:
  append: " This is your second to last line. Begin wrapping the story toward a close."

if turn === 15:
  append: " This is your FINAL line. End the story with a beautiful closing sentence."
```

### Step 2 — Build messages array

```ts
[
  { role: 'system', content: systemPrompt },
  ...history,
  // only if redirect is not null:
  { role: 'user', content: `Story change: ${redirect}. Continue naturally.` },
  { role: 'user', content: 'Your turn. One sentence only.' }
]
```

### Step 3 — Call Groq

```ts
groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  max_tokens: 80,
  temperature: 0.8,
  messages: messagesArray
})
```

### Step 4 — Return response

Strip leading/trailing whitespace and quotation marks from the response content.

### Error handling

On any error: wait 1000ms, retry once. If the retry also fails, throw the error.
