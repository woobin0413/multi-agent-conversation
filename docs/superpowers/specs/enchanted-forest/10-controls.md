# Feature: Controls Component

**File:** `frontend/src/components/Controls.tsx`

Renders the four story control buttons and a status message.

---

## Props

```ts
interface Props {
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  isPaused: boolean
  isComplete: boolean
  hasStarted: boolean
  status: string
}
```

---

## Buttons

| Button | Label | Disabled when |
|---|---|---|
| Begin Story | "Begin Story" | `hasStarted && !isComplete` |
| Pause | "Pause" | `isPaused \|\| isComplete \|\| !hasStarted` |
| Resume | "Resume" | `!isPaused \|\| isComplete` |
| Reset | "Reset" | Never disabled |

All buttons call their respective `on*` prop on click.

---

## Status Text

Render `status` as small italic muted text below the buttons.

Animate status changes with a brief fade transition (opacity 0 → 1 over 200ms) when the string changes. Use a `key` prop or CSS transition on the status element.

---

## Layout

Buttons grouped horizontally (flex row, gap between). Status text centered below.

Use Tailwind for styling. Suggest button styles:
- Begin Story: primary (purple background)
- Pause / Resume: secondary (outline or gray)
- Reset: subtle (ghost or light gray)
