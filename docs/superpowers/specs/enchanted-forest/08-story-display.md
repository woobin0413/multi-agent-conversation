# Feature: StoryDisplay Component

**File:** `frontend/src/components/StoryDisplay.tsx`

Scrollable container that renders all story sentences as chat bubbles and shows the ending when the story completes.

---

## Props

```ts
interface Props {
  sentences: StoryEvent[]
  isComplete: boolean
}
```

---

## Behaviour

- Renders each item in `sentences` as a `<ChatBubble event={sentence} />` component
- Max height: `480px`, overflow: `scroll` (vertical)
- Auto-scrolls to bottom whenever `sentences` array changes:
  - Use `useRef` on a div at the bottom of the list
  - Call `ref.current?.scrollIntoView({ behavior: 'smooth' })` inside `useEffect([sentences])`

---

## "The End" State

When `isComplete` is `true`, render below the last bubble:

```
~ The End ~
```

Styling:
- Centered
- Italic
- Muted color (e.g. `text-gray-400`)
- Fade in with CSS animation:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

Apply `animation: fadeIn 1s ease`.

---

## Empty State

When `sentences` is empty (story not started), render nothing or a minimal placeholder. Do not show an empty scrollable box.
