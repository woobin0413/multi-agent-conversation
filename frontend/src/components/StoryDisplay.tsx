import { useEffect, useRef } from 'react';
import { DisplayItem, StoryEvent, RedirectMarker } from '../types/story.types';
import { ChatBubble } from './ChatBubble';

interface Props {
  displayItems: DisplayItem[];
  isComplete: boolean;
}

function isRedirect(item: DisplayItem): item is RedirectMarker {
  return 'type' in item && item.type === 'redirect';
}

function isStoryEvent(item: DisplayItem): item is StoryEvent {
  return 'character' in item;
}

export function StoryDisplay({ displayItems, isComplete }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayItems]);

  if (displayItems.length === 0) {
    return null;
  }

  const lastStoryIndex = displayItems.reduce(
    (last, item, i) => (isStoryEvent(item) ? i : last),
    -1,
  );

  return (
    <div className="max-h-[480px] overflow-y-auto mb-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {displayItems.map((item, index) => {
        if (isRedirect(item)) {
          return (
            <div key={`redirect-${index}`} className="flex justify-center my-3 animate-bubble-in">
              <div className="px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                  <span className="font-bold">You redirected:</span> {item.message}
                </p>
              </div>
            </div>
          );
        }
        return (
          <ChatBubble
            key={item.turn}
            event={item}
            isLatest={index === lastStoryIndex}
          />
        );
      })}
      {isComplete && (
        <p className="text-center italic text-gray-400 dark:text-gray-500 mt-4 animate-fade-in">
          ~ The End ~
        </p>
      )}
      <div ref={endRef} />
    </div>
  );
}
