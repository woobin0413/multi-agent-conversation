# Feature: RedirectInput Component

**File:** `frontend/src/components/RedirectInput.tsx`

Lets the user inject a story redirect mid-generation. The redirect is queued and applied on the next agent turn.

---

## Props

```ts
interface Props {
  onRedirect: (message: string) => void
  disabled: boolean
}
```

---

## Behaviour

- Text input with placeholder: `"Change the story... e.g. make a dragon appear"`
- "Redirect" button next to the input
- On button click **or** `Enter` keypress:
  1. Call `onRedirect(inputValue)`
  2. Clear the input
- Disable both the input and the button when `disabled` is `true`

---

## Disabled States

`disabled` is `true` when:
- Story has not started yet
- Story is complete

Disabled input and button should use Tailwind's `disabled:` variants (`disabled:opacity-50 disabled:cursor-not-allowed`).

---

## Layout

```
┌─────────────────────────────────────────────┬──────────────┐
│ Change the story... e.g. make a dragon appear│   Redirect   │
└─────────────────────────────────────────────┴──────────────┘
```

Full-width flex row. Input takes remaining space (`flex-1`), button fixed width.
