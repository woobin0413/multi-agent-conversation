import { StorySession } from '../src/story/story.session';

describe('StorySession', () => {
  let session: StorySession;

  beforeEach(() => {
    session = new StorySession('test-id');
  });

  it('initializes with correct defaults', () => {
    expect(session.sessionId).toBe('test-id');
    expect(session.history).toEqual([]);
    expect(session.currentTurn).toBe(0);
    expect(session.isPaused).toBe(false);
    expect(session.isComplete).toBe(false);
    expect(session.pendingRedirect).toBeNull();
  });

  it('incrementTurn increases currentTurn by 1', () => {
    session.incrementTurn();
    expect(session.currentTurn).toBe(1);
    session.incrementTurn();
    expect(session.currentTurn).toBe(2);
  });

  it('getNextCharacter returns Luna on odd turns, Oak on even', () => {
    session.incrementTurn(); // turn 1
    expect(session.getNextCharacter()).toBe('Luna');
    session.incrementTurn(); // turn 2
    expect(session.getNextCharacter()).toBe('Oak');
    session.incrementTurn(); // turn 3
    expect(session.getNextCharacter()).toBe('Luna');
  });

  it('injectRedirect sets pendingRedirect', () => {
    session.injectRedirect('add a dragon');
    expect(session.pendingRedirect).toBe('add a dragon');
  });

  it('consumeRedirect returns redirect then clears it', () => {
    session.injectRedirect('add a dragon');
    expect(session.consumeRedirect()).toBe('add a dragon');
    expect(session.consumeRedirect()).toBeNull();
  });

  it('addToHistory pushes formatted entry', () => {
    session.addToHistory('Luna', 'The forest glowed.');
    expect(session.history).toEqual([
      { role: 'assistant', content: 'Luna: The forest glowed.' },
    ]);
  });
});
