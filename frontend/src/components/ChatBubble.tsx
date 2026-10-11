import { useState, useEffect } from 'react';
import { StoryEvent } from '../types/story.types';

interface Props {
  event: StoryEvent;
  isLatest: boolean;
}

export function ChatBubble({ event, isLatest }: Props) {
  const [displayed, setDisplayed] = useState(isLatest ? '' : event.text);
  const isLuna = event.character === 'Luna';

  useEffect(() => {
    if (!isLatest) {
      setDisplayed(event.text);
      return;
    }
    const words = event.text.split(' ');
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      setDisplayed(words.slice(0, i).join(' '));
      if (i >= words.length) clearInterval(interval);
    }, 150);
    return () => clearInterval(interval);
  }, [event.text, isLatest]);

  return (
    <div
      className={`flex ${isLuna ? 'justify-start' : 'justify-end'} mb-3 animate-bubble-in`}
    >
      <div
        className="max-w-[80%] px-4 py-3"
        style={{
          backgroundColor: event.bgColor,
          color: event.color,
          borderRadius: isLuna
            ? '12px 12px 12px 0'
            : '12px 12px 0 12px',
        }}
      >
        <p className="text-xs font-bold mb-1">{event.character}</p>
        <p className="text-sm leading-relaxed">{displayed}</p>
        <p className="text-xs mt-1 opacity-50">
          Turn {event.turn} of {event.total}
        </p>
      </div>
    </div>
  );
}
