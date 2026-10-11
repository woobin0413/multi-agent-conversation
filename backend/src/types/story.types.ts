export interface StoryEvent {
  turn: number;
  total: number;
  character: 'Luna' | 'Oak';
  color: string;
  bgColor: string;
  text: string;
  isFinal: boolean;
}

export interface StoryStatus {
  sessionId: string;
  currentTurn: number;
  isPaused: boolean;
  isComplete: boolean;
}

export interface RedirectPayload {
  message: string;
}

export interface MoodPayload {
  lunaMood: string | null;
  oakMood: string | null;
}
