import { useState, useRef, useCallback, useEffect } from 'react';

async function apiFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("Request rejected");
  return response;
}

import { StoryEvent, DisplayItem } from '../types/story.types';

export function useStory() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sentences, setSentences] = useState<StoryEvent[]>([]);
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [status, setStatus] = useState('Choose moods and start the conversation');
  const [lunaMood, setLunaMood] = useState<string | null>(null);
  const [oakMood, setOakMood] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStory = useCallback(async () => {
    try {
      const res = await apiFetch('/story/start', { method: 'POST' });
      const { sessionId: newSessionId } = await res.json();

      if (lunaMood || oakMood) {
        await apiFetch(`/story/mood/${newSessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lunaMood, oakMood }),
        });
      }

      setSessionId(newSessionId);
      setSentences([]);
      setDisplayItems([]);
      setIsComplete(false);
      setIsPaused(false);
      setCurrentTurn(0);
      setStatus('Starting conversation...');

      const es = new EventSource(`/story/stream/${newSessionId}`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        const data: StoryEvent = JSON.parse(e.data);
        setSentences((prev) => [...prev, data]);
        setDisplayItems((prev) => [...prev, data]);
        setCurrentTurn(data.turn);
        setStatus(`${data.character} is speaking...`);

        if (data.isFinal) {
          setIsComplete(true);
          setStatus('Conversation ended');
          es.close();
          eventSourceRef.current = null;
        }
      };

      es.onerror = () => {
        setStatus('Connection lost');
        es.close();
        eventSourceRef.current = null;
      };
    } catch {
      setStatus('Failed to start');
    }
  }, [lunaMood, oakMood]);

  const pauseStory = useCallback(async () => {
    if (!sessionId) return;
    try {
      await apiFetch(`/story/pause/${sessionId}`, { method: 'POST' });
      setIsPaused(true);
      setStatus('Paused');
    } catch {
      setStatus('Failed to pause');
    }
  }, [sessionId]);

  const resumeStory = useCallback(async () => {
    if (!sessionId) return;
    try {
      await apiFetch(`/story/resume/${sessionId}`, { method: 'POST' });
      setIsPaused(false);
      setStatus('Resuming...');
    } catch {
      setStatus('Failed to resume');
    }
  }, [sessionId]);

  const redirectStory = useCallback(
    async (message: string) => {
      if (!sessionId) return;
      try {
        await apiFetch(`/story/redirect/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        setDisplayItems((prev) => [...prev, { type: 'redirect' as const, message }]);
        setStatus('Redirect queued for next turn');
      } catch {
        setStatus('Failed to send redirect');
      }
    },
    [sessionId],
  );

  const updateMoods = useCallback(
    async (newLunaMood: string | null, newOakMood: string | null) => {
      if (sessionId) {
        try {
          await apiFetch(`/story/mood/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lunaMood: newLunaMood, oakMood: newOakMood }),
          });
        } catch {
          setStatus('Failed to update moods');
          return;
        }
      }
      setLunaMood(newLunaMood);
      setOakMood(newOakMood);
    },
    [sessionId],
  );

  const setLunaMoodFn = useCallback(
    (mood: string | null) => {
      if (sessionId) {
        updateMoods(mood, oakMood);
      } else {
        setLunaMood(mood);
      }
    },
    [sessionId, oakMood, updateMoods],
  );

  const setOakMoodFn = useCallback(
    (mood: string | null) => {
      if (sessionId) {
        updateMoods(lunaMood, mood);
      } else {
        setOakMood(mood);
      }
    },
    [sessionId, lunaMood, updateMoods],
  );

  const resetStory = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSessionId(null);
    setSentences([]);
    setDisplayItems([]);
    setIsPaused(false);
    setIsComplete(false);
    setCurrentTurn(0);
    setLunaMood(null);
    setOakMood(null);
    setStatus('Choose moods and start the conversation');
  }, []);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const hasStarted = sessionId !== null;

  return {
    sessionId,
    sentences,
    displayItems,
    isPaused,
    isComplete,
    currentTurn,
    status,
    lunaMood,
    oakMood,
    hasStarted,
    startStory,
    pauseStory,
    resumeStory,
    redirectStory,
    resetStory,
    setLunaMood: setLunaMoodFn,
    setOakMood: setOakMoodFn,
  };
}
