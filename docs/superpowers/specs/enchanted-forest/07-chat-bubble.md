# Feature: ChatBubble Component

**File:** `frontend/src/components/ChatBubble.tsx`

Renders a single story sentence as a styled chat bubble with typewriter animation.

---

## Props

```ts
interface Props {
  event: StoryEvent
}
```

---

## Layout

- **Luna** (left-aligned):
  - `justify-start` on the row container
  - Bubble: `border-radius: 12px 12px 12px 0` (bottom-left flat)
  - Background: `event.bgColor` (`#EEEDFE`)
  - Text color: `event.color` (`#3C3489`)

- **Oak** (right-aligned):
  - `justify-end` on the row container
  - Bubble: `border-radius: 12px 12px 0 12px` (bottom-right flat)
  - Background: `event.bgColor` (`#EAF3DE`)
  - Text color: `event.color` (`#27500A`)

Inside each bubble:
- Character name in small bold text above the sentence
- Sentence text (typewriter effect — see below)
- Sentence number in tiny muted text below (`Sentence {event.turn} of {event.total}`)

---

## Typewriter Effect

Split `event.text` by spaces into words. Reveal one word every 80ms using `setInterval` inside `useEffect`.

```ts
const [displayed, setDisplayed] = useState('')
const words = event.text.split(' ')

useEffect(() => {
  let i = 0
  const interval = setInterval(() => {
    i++
    setDisplayed(words.slice(0, i).join(' '))
    if (i >= words.length) clearInterval(interval)
  }, 80)
  return () => clearInterval(interval)
}, [event.text])
```

Render `displayed` as the bubble text.

---

## Mount Animation

Fade in + slide up on mount using CSS keyframes:

```css
@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Apply `animation: bubbleIn 0.3s ease` to the bubble wrapper on mount.
