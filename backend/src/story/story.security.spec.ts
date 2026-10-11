import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { AgentsService } from './agents.service';

let service: StoryService;
let call: jest.Mock;
beforeEach(() => {
  jest.useFakeTimers();
  call = jest.fn().mockResolvedValue('Synthetic sentence.');
  service = new StoryService({ callAgent: call } as unknown as AgentsService);
});
afterEach(() => { service.onModuleDestroy(); jest.useRealTimers(); });

test('session ownership and expiry protect every operation', () => {
  const session = service.createSession('owner');
  expect(() => service.getSession(session.sessionId, 'other')).toThrow();
  expect(() => service.pauseSession(session.sessionId, '')).toThrow();
  expect(() => service.redirectSession(session.sessionId, 'other', 'hello')).toThrow();
  jest.advanceTimersByTime(30 * 60_000);
  expect(() => service.getSession(session.sessionId, 'owner')).toThrow();
});
test('start bursts and retention are bounded', () => {
  for (let i = 0; i < 20; i++) service.createSession('owner');
  expect(() => service.createSession('owner')).toThrow('usage limit');
  for (let minute = 0; minute < 4; minute++) {
    jest.advanceTimersByTime(60_000);
    for (let i = 0; i < 20; i++) service.createSession('owner');
  }
  jest.advanceTimersByTime(60_000);
  expect(() => service.createSession('owner')).toThrow('capacity');
  jest.advanceTimersByTime(30 * 60_000);
  expect(service.createSession('owner')).toBeDefined();
});
test('redirect and mood values are bounded and allowlisted', () => {
  const { sessionId: id } = service.createSession('owner');
  for (const input of ['', {}, 'x'.repeat(501)]) expect(() => service.redirectSession(id, 'owner', input)).toThrow();
  expect(() => service.setMoods(id, 'owner', 'arbitrary system instruction', null)).toThrow();
  expect(() => service.setMoods(id, 'owner', undefined, null)).toThrow();
  service.setMoods(id, 'owner', 'friendly', null);
  service.redirectSession(id, 'owner', 'a synthetic plot twist');
});
test('streams cannot restart or run concurrently, including after disconnect', async () => {
  const { sessionId: id } = service.createSession('owner');
  const stream = service.openStream(id, 'owner');
  expect(() => service.openStream(id, 'owner')).toThrow();
  const event = await stream.events.next();
  expect(event.value?.turn).toBe(1); expect(call).toHaveBeenCalledTimes(1);
  stream.close(); await stream.events.return(undefined);
  expect(() => service.openStream(id, 'owner')).toThrow();
});
test('provider concurrency and paused-stream lifetime are bounded and abortable', async () => {
  const ids = [0, 1, 2].map(() => service.createSession('owner').sessionId);
  const first = service.openStream(ids[0], 'owner'); const second = service.openStream(ids[1], 'owner');
  expect(() => service.openStream(ids[2], 'owner')).toThrow('capacity');
  service.pauseSession(ids[0], 'owner');
  const waiting = first.events.next(); const rejected = expect(waiting).rejects.toThrow();
  await jest.advanceTimersByTimeAsync(120_001); await rejected;
  expect(call).not.toHaveBeenCalled(); second.close();
});
test('owner cookie is HttpOnly and same-site, and is not returned in JSON', () => {
  const controller = new StoryController(service); const setHeader = jest.fn();
  const result = controller.start({ headers: {} }, { setHeader });
  expect(Object.keys(result)).toEqual(['sessionId']);
  const cookie = setHeader.mock.calls[0][1];
  expect(cookie).toMatch(/story_owner=[a-f0-9]{64}; HttpOnly; SameSite=Strict/);
  expect(() => controller.status(result.sessionId, { headers: {} })).toThrow();
  expect(controller.status(result.sessionId, { headers: { cookie } }).sessionId).toBe(result.sessionId);
});
