# Feature: App Layout

**File:** `frontend/src/App.tsx`

Root component. Composes all components using the `useStory` hook. Handles dark mode via Tailwind.

---

## Hook Usage

```ts
const {
  sentences, isPaused, isComplete, currentTurn,
  status, hasStarted,
  startStory, pauseStory, resumeStory, resetStory, redirectStory
} = useStory()
```

---

## Layout Structure

Centered, max width `680px`, margin auto, vertical padding. Use Tailwind `dark:` classes for dark mode support.

```
┌──────────────────────────────────────────┐
│              The Enchanted Forest        │  ← h1
│   Two AI agents telling a story,         │  ← subtitle p
│            15 sentences                  │
│                                          │
│  [Luna badge]        [Oak badge]         │  ← character badges
│                                          │
│  ████████████░░░░░░░  Sentence 6 of 15   │  ← ProgressBar (only if started)
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Luna: ...                         │  │  ← StoryDisplay (scrollable)
│  │                         Oak: ...   │  │
│  │  Luna: ...                         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Begin Story] [Pause] [Resume] [Reset]  │  ← Controls
│  status: Luna is speaking...             │
│                                          │
│  [Change the story...    ] [Redirect]    │  ← RedirectInput
└──────────────────────────────────────────┘
```

---

## Character Badges

Two side-by-side badges in the header:

**Luna badge:**
- Background: `#EEEDFE`
- Text: `#3C3489`
- Name: **Luna**
- Role: "Curious young wizard"

**Oak badge:**
- Background: `#EAF3DE`
- Text: `#27500A`
- Name: **Oak**
- Role: "Ancient talking tree"

Small rounded pill style. Display inline-flex, padding `px-3 py-1`, `border-radius: 9999px`.

---

## Conditional Rendering

- `ProgressBar`: only render when `currentTurn > 0`
- `RedirectInput`: `disabled={!hasStarted || isComplete}`

---

## Dark Mode

Use Tailwind `dark:` variants on background and text colors. The page background should switch between white (light) and dark gray/slate (dark).
