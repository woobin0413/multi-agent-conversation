import { Test } from '@nestjs/testing';
import { StoryModule } from './story/story.module';
import { AgentsService } from './story/agents.service';
import { configureHttpSecurity } from './http-security';
import type { INestApplication } from '@nestjs/common';
let app: INestApplication; let base: string;
beforeAll(async () => {
  const module = await Test.createTestingModule({ imports: [StoryModule] })
    .overrideProvider(AgentsService).useValue({ callAgent: jest.fn().mockResolvedValue('Synthetic sentence.') }).compile();
  app = module.createNestApplication({ bodyParser: false }); configureHttpSecurity(app);
  await app.listen(0, '127.0.0.1'); base = await app.getUrl();
});
afterAll(() => app.close());
test('foreign origins and cross-site browser requests cannot create sessions', async () => {
  for (const headers of [{ Origin: 'https://example.invalid' }, { 'Sec-Fetch-Site': 'cross-site' }] as Record<string, string>[]) {
    expect((await fetch(base + '/story/start', { method: 'POST', headers })).status).toBe(403);
  }
});
test('owner cookies protect HTTP controls and oversized JSON is rejected before parsing', async () => {
  const start = await fetch(base + '/story/start', { method: 'POST', headers: { Origin: 'http://localhost:5173' } });
  expect(start.status).toBe(201); const session = await start.json(); const cookie = start.headers.get('set-cookie')!;
  expect((await fetch(base + '/story/status/' + session.sessionId)).status).toBe(404);
  expect((await fetch(base + '/story/status/' + session.sessionId, { headers: { Cookie: cookie } })).status).toBe(200);
  expect((await fetch(base + '/story/redirect/' + session.sessionId, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'x'.repeat(9000) }) })).status).toBe(413);
  expect((await fetch(base + '/story/stream/' + session.sessionId, { headers: { Cookie: cookie, Origin: 'https://example.invalid' } })).status).toBe(403);
});
