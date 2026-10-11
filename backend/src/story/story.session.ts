export class StorySession {
  sessionId: string;
  history: Array<{ role: string; content: string }>;
  currentTurn: number;
  isPaused: boolean;
  isComplete: boolean;
  pendingRedirect: string | null;
  lunaMood: string | null;
  oakMood: string | null;
  ownerId: string;
  expiresAt: number;
  started = false;

  constructor(sessionId: string, ownerId = '', expiresAt = Date.now() + 30 * 60_000) {
    this.sessionId = sessionId;
    this.history = [];
    this.currentTurn = 0;
    this.isPaused = false;
    this.isComplete = false;
    this.pendingRedirect = null;
    this.lunaMood = null;
    this.oakMood = null;
    this.ownerId = ownerId;
    this.expiresAt = expiresAt;
  }

  getNextCharacter(): 'Luna' | 'Oak' {
    return this.currentTurn % 2 !== 0 ? 'Luna' : 'Oak';
  }

  incrementTurn(): void {
    this.currentTurn++;
  }

  injectRedirect(message: string): void {
    this.pendingRedirect = message;
  }

  consumeRedirect(): string | null {
    const redirect = this.pendingRedirect;
    this.pendingRedirect = null;
    return redirect;
  }

  getMoodForCharacter(character: 'Luna' | 'Oak'): string | null {
    return character === 'Luna' ? this.lunaMood : this.oakMood;
  }

  addToHistory(character: string, line: string): void {
    this.history.push({ role: 'assistant', content: `${character}: ${line}` });
  }
}
