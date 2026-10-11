import { NotFoundException } from '@nestjs/common';
import { StoryService } from '../src/story/story.service';
import { AgentsService } from '../src/story/agents.service';

describe('StoryService', () => {
  let service: StoryService;
  let mockAgentsService: jest.Mocked<AgentsService>;

  beforeEach(() => {
    mockAgentsService = {
      callAgent: jest.fn().mockResolvedValue('A test sentence.'),
    } as any;
    service = new StoryService(mockAgentsService);
  });

  describe('createSession', () => {
    it('creates a session with a UUID', () => {
      const session = service.createSession('test-owner');
      expect(session.sessionId).toBeDefined();
      expect(session.sessionId.length).toBeGreaterThan(0);
      expect(session.currentTurn).toBe(0);
    });
  });

  describe('getSession', () => {
    it('returns an existing session', () => {
      const created = service.createSession('test-owner');
      const fetched = service.getSession(created.sessionId, 'test-owner');
      expect(fetched.sessionId).toBe(created.sessionId);
    });

    it('throws NotFoundException for unknown sessionId', () => {
      expect(() => service.getSession('nonexistent', 'test-owner')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('pauseSession / resumeSession', () => {
    it('toggles isPaused', () => {
      const session = service.createSession('test-owner');
      service.pauseSession(session.sessionId, 'test-owner');
      expect(session.isPaused).toBe(true);
      service.resumeSession(session.sessionId, 'test-owner');
      expect(session.isPaused).toBe(false);
    });
  });

  describe('redirectSession', () => {
    it('sets pendingRedirect on the session', () => {
      const session = service.createSession('test-owner');
      service.redirectSession(session.sessionId, 'test-owner', 'add a dragon');
      expect(session.pendingRedirect).toBe('add a dragon');
    });
  });

  describe('streamStory', () => {
    it('yields 15 StoryEvents', async () => {
      const session = service.createSession('test-owner');
      const events = [];
      for await (const event of service.openStream(session.sessionId, 'test-owner').events) {
        events.push(event);
      }
      expect(events).toHaveLength(15);
      expect(events[0].turn).toBe(1);
      expect(events[0].character).toBe('Luna');
      expect(events[14].turn).toBe(15);
      expect(events[14].isFinal).toBe(true);
      expect(session.isComplete).toBe(true);
    }, 60000);

    it('alternates between Luna and Oak', async () => {
      const session = service.createSession('test-owner');
      const characters: string[] = [];
      for await (const event of service.openStream(session.sessionId, 'test-owner').events) {
        characters.push(event.character);
      }
      expect(characters[0]).toBe('Luna');
      expect(characters[1]).toBe('Oak');
      expect(characters[2]).toBe('Luna');
    }, 60000);
  });
});
