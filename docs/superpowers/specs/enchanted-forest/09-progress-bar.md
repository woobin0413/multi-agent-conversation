# Feature: ProgressBar Component

**File:** `frontend/src/components/ProgressBar.tsx`

Thin progress bar showing how far through the 15-sentence story the user is.

---

## Props

```ts
interface Props {
  current: number   // current turn (1–15)
  total: number     // always 15
}
```

---

## Behaviour

- Width percentage: `(current / total) * 100`
- Fill color: `#7F77DD` (purple)
- Animate width changes: `transition: width 0.5s ease`
- Show label below bar: `"Sentence {current} of {total}"`

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│ [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] │  ← thin bar, ~6px height
│ Sentence 6 of 15                                     │  ← small muted text
└─────────────────────────────────────────────────────┘
```

- Bar container: full width, gray background (`bg-gray-200`), rounded
- Fill div: height `6px`, `border-radius` matching container, background `#7F77DD`
- Label: `text-sm text-gray-500`, below the bar

---

## Only Show After Story Starts

`ProgressBar` is conditionally rendered in `App.tsx` — only shown when `currentTurn > 0`. The component itself does not need to handle the hidden state.
