# Spec-Driven Software Development Guide

## What Is Spec-Driven Development?

Spec-Driven Development (SDD) is a methodology where **detailed specifications are written before any implementation code**. Instead of diving straight into coding and figuring things out as you go, you invest time upfront to define exactly what the system should do, how components interact, and what the data structures look like.

In the context of AI-assisted development, SDD becomes even more powerful: specs serve as precise instructions that AI coding agents can follow autonomously with minimal ambiguity.

---

## Core Principles

### 1. Specification First, Code Second

Every feature, component, and service is fully specified in a standalone document before any code is written. Specs define:

- **Interfaces and types** — exact field names, types, and constraints
- **Method signatures** — inputs, outputs, and side effects
- **Behavior** — what happens under normal conditions and edge cases
- **Data flow** — how data moves between components

### 2. Atomic, Numbered Specs

Each specification covers a single, focused concern and is numbered for clear ordering. This creates a natural implementation sequence and makes specs easy to reference.

Example ordering:
```
00-project-overview.md      # Architecture & tech stack
01-shared-types.md          # TypeScript interfaces
02-session-state.md         # State management class
03-service-layer.md         # Business logic
04-controller.md            # HTTP endpoints
05-frontend-hook.md         # React state management
06-component-a.md           # UI component
07-component-b.md           # UI component
...
13-data-flow-and-errors.md  # Cross-cutting concerns
```

### 3. Specs Are the Source of Truth

When there's ambiguity about how something should work, the spec is the authoritative reference. Code should match the spec, not the other way around.

### 4. Implementation Plans Reference Specs

After specs are written, an implementation plan is created that breaks the work into discrete tasks. Each task references the relevant specs and provides step-by-step instructions.

---

## The Spec-Driven Development Workflow

```
Phase 1: SPECIFY
  ├── Define the project overview (architecture, tech stack, file structure)
  ├── Define shared types and interfaces
  ├── Spec each backend service/module
  ├── Spec each frontend component/hook
  └── Spec cross-cutting concerns (data flow, errors, edge cases)

Phase 2: PLAN
  ├── Create a file map (what files need to be created)
  ├── Break work into numbered tasks
  ├── Each task references relevant specs
  └── Include code snippets for critical sections

Phase 3: IMPLEMENT
  ├── Follow the plan task by task
  ├── Each task produces working, testable code
  ├── AI agents can execute tasks autonomously
  └── Review checkpoints after each task

Phase 4: VERIFY
  ├── Run tests (unit, integration)
  ├── Compare implementation against specs
  ├── Confirm data flows match spec diagrams
  └── Validate error handling matches spec
```

---

## What Makes a Good Spec?

### Must Include

| Element | Why |
|---|---|
| **File path** | Tells exactly where the code lives |
| **Dependencies** | What this module imports/injects |
| **Type definitions** | Exact interfaces with field-level comments |
| **Method signatures** | Name, parameters, return type |
| **Behavior description** | Step-by-step logic, not just "handles X" |
| **Edge cases** | What happens when things go wrong |

### Must Avoid

| Anti-pattern | Why |
|---|---|
| Vague descriptions ("handles the data") | AI agents can't infer intent |
| Missing types | Leads to inconsistent implementations |
| Implicit assumptions | If it's not in the spec, it doesn't exist |
| Over-specification of implementation details | Spec the *what*, not every line of code |

### Example: A Good Spec

```markdown
# Feature: StoryService

**File:** `backend/src/story/story.service.ts`

Injectable NestJS service. Owns the session map and drives generation.

## Dependencies
- Inject `AgentsService`
- Private field: `sessions = new Map<string, StorySession>()`

## Methods

### `createSession(): StorySession`
- Generate `sessionId` with `crypto.randomUUID()`
- Create `new StorySession(sessionId)`
- Store in `sessions` map
- Return the session

### `streamStory(sessionId: string): AsyncGenerator<StoryEvent>`
- Loop from turn 1 to 15
- Check pause state each iteration (sleep 300ms while paused)
- Call agentsService.callAgent() for each turn
- Yield a StoryEvent with character, text, colors, isFinal
- Set session.isComplete = true after loop
```

---

## Why Spec-Driven Development for AI-Assisted Coding?

### 1. AI Agents Need Clear Instructions

LLMs generate better code when given precise, unambiguous specifications. A spec acts as a detailed prompt that eliminates guesswork.

**Without SDD:**
> "Build a story app with two AI characters"
> Result: AI makes hundreds of decisions you didn't intend

**With SDD:**
> Spec defines exact types, methods, behaviors, and error handling
> Result: AI produces code that matches your design precisely

### 2. Parallel Agent Execution

When specs are atomic and independent, multiple AI agents can implement different parts of the system simultaneously. Agent 1 works on the backend service while Agent 2 builds the frontend component — both following their respective specs.

### 3. Deterministic Output

The same spec given to different agents (or the same agent at different times) should produce functionally equivalent code. Specs reduce the variance in AI-generated output.

### 4. Easy Review and Verification

Reviewing AI-generated code is straightforward: compare the output against the spec. If the code matches the spec, it's correct. If it doesn't, the deviation is easy to spot.

### 5. Knowledge Transfer

Specs serve as documentation that outlives any single conversation with an AI assistant. New team members (human or AI) can read the specs to understand the system without needing to reverse-engineer the code.

### 6. Reduced Iteration Cycles

Without specs, AI development often follows a trial-and-error loop:
```
Vague prompt → Wrong output → Correction → Partial fix → More corrections → ...
```

With specs:
```
Detailed spec → Correct output → Minor adjustments → Done
```

---

## Implementation Plan Structure

A good implementation plan bridges specs to code. It should include:

### 1. File Map
A table listing every file to create, its responsibility, and which spec it references.

### 2. Ordered Tasks
Numbered tasks with clear dependencies:
```markdown
## Task 1: Backend Scaffolding
**Files:** package.json, tsconfig.json, main.ts, app.module.ts
- [ ] Step 1: Create package.json with dependencies
- [ ] Step 2: Create TypeScript config
- [ ] Step 3: Create NestJS bootstrap

## Task 2: Shared Types
**Files:** backend/src/types/story.types.ts, frontend/src/types/story.types.ts
**Spec:** 01-shared-types.md
- [ ] Step 1: Create StoryEvent, StoryStatus, RedirectPayload interfaces
```

### 3. Code Snippets for Critical Sections
For complex logic, include the expected code directly:
```markdown
### `streamStory` loop
\```ts
for (let turn = 1; turn <= 15; turn++) {
  session.incrementTurn()
  const character = session.getNextCharacter()
  while (session.isPaused) await this.sleep(300)
  // ...
}
\```
```

---

## Spec-Driven vs Other Approaches

| Aspect | Spec-Driven | Prompt-Driven | Test-Driven |
|---|---|---|---|
| **Upfront investment** | High (write specs) | Low (write prompts) | Medium (write tests) |
| **AI output quality** | High (precise instructions) | Variable (depends on prompt) | Medium (tests constrain output) |
| **Parallelization** | Excellent (independent specs) | Poor (sequential prompts) | Good (independent test suites) |
| **Documentation** | Built-in (specs ARE docs) | None | Tests as partial docs |
| **Iteration cycles** | Few | Many | Few to moderate |
| **Scalability** | Excellent | Poor | Good |
| **Best for** | Multi-component systems | Small, one-off tasks | Well-defined algorithms |

---

## Best Practices

1. **Start with the overview spec** — Define architecture, tech stack, and file structure first
2. **Define types early** — Shared interfaces prevent mismatches between components
3. **One spec per concern** — Keep specs focused and atomic
4. **Number your specs** — Create a natural implementation order
5. **Include data flow diagrams** — Show how events/data move through the system
6. **Spec error handling explicitly** — Don't leave edge cases to the implementer
7. **Write the plan after specs** — The plan is a task list, not a design document
8. **Review specs before implementing** — Catch design issues before they become code issues
9. **Keep specs updated** — If the implementation diverges, update the spec or fix the code

---

## Getting Started

1. **Pick your feature** — What are you building?
2. **Write the project overview spec** — Architecture, tech stack, file structure
3. **Define shared types** — Interfaces that cross component boundaries
4. **Spec each component** — One file per service, controller, hook, or UI component
5. **Add a data flow spec** — How do events and data move through the system?
6. **Write the implementation plan** — Ordered tasks with file maps and checkpoints
7. **Hand it to your AI agent** — Let it implement task by task
8. **Review against specs** — Verify the output matches your design
