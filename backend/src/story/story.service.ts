import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { StorySession } from './story.session';
import { AgentsService } from './agents.service';
import { StoryEvent } from '../types/story.types';

export const MOODS = new Set(['friendly', 'funny', 'angry', 'romantic', 'sarcastic', 'philosophical', 'dramatic', 'mysterious']);
const TTL = 30 * 60_000;

@Injectable()
export class StoryService implements OnModuleDestroy {
  private sessions = new Map<string, StorySession>();
  private active = new Set<AbortController>();
  private starts = { count: 0, reset: 0 };
  private calls = { count: 0, reset: 0 };
  private cleanup = setInterval(() => this.prune(), 60_000).unref();
  constructor(private readonly agentsService: AgentsService) {}
  onModuleDestroy() {
    clearInterval(this.cleanup);
    for (const controller of this.active) controller.abort();
  }
  private prune() {
    for (const [id, session] of this.sessions) if (session.expiresAt <= Date.now()) this.sessions.delete(id);
  }
  private consume(budget: { count: number; reset: number }, max: number, window: number) {
    if (Date.now() >= budget.reset) { budget.count = 0; budget.reset = Date.now() + window; }
    if (budget.count >= max) throw new HttpException('Local demo usage limit reached', 429);
    budget.count++;
  }
  createSession(ownerId: string): StorySession {
    if (!ownerId) throw new NotFoundException();
    this.prune();
    if (this.sessions.size >= 100) throw new HttpException('Local demo capacity reached', 429);
    this.consume(this.starts, 20, 60_000);
    const session = new StorySession(randomUUID(), ownerId, Date.now() + TTL);
    this.sessions.set(session.sessionId, session);
    return session;
  }
  getSession(id: string, ownerId: string): StorySession {
    const session = this.sessions.get(id);
    if (!session || !ownerId || session.ownerId !== ownerId || session.expiresAt <= Date.now()) throw new NotFoundException();
    return session;
  }
  pauseSession(id: string, owner: string) { this.getSession(id, owner).isPaused = true; }
  resumeSession(id: string, owner: string) { this.getSession(id, owner).isPaused = false; }
  redirectSession(id: string, owner: string, message: unknown) {
    const session = this.getSession(id, owner);
    if (typeof message !== 'string' || !message.trim() || message.length > 500) throw new BadRequestException('Invalid redirect');
    session.injectRedirect(message.trim());
  }
  setMoods(id: string, owner: string, luna: unknown, oak: unknown) {
    const session = this.getSession(id, owner);
    for (const mood of [luna, oak]) if (mood !== null && (typeof mood !== 'string' || !MOODS.has(mood))) throw new BadRequestException('Invalid mood');
    session.lunaMood = luna as string | null; session.oakMood = oak as string | null;
  }
  openStream(id: string, owner: string) {
    const session = this.getSession(id, owner);
    if (session.started || session.isComplete) throw new ConflictException('Start a new conversation');
    if (this.active.size >= 2) throw new HttpException('Local demo generation capacity reached', 429);
    session.started = true;
    const controller = new AbortController(); this.active.add(controller);
    const deadline = setTimeout(() => controller.abort(), 120_000);
    const close = () => { clearTimeout(deadline); controller.abort(); this.active.delete(controller); session.isComplete = true; };
    return { events: this.generate(session, controller.signal, close), close };
  }
  private async *generate(session: StorySession, signal: AbortSignal, close: () => void): AsyncGenerator<StoryEvent> {
    try {
      session.history.push({ role: 'user', content: 'Luna and Oak are meeting for the first time. Start with a friendly greeting and let the conversation flow naturally.' });
      for (let turn = 1; turn <= 15; turn++) {
        while (session.isPaused) await sleep(300, undefined, { signal });
        signal.throwIfAborted();
        // Global per-process provider budget; this app deliberately remains local-only.
        this.consume(this.calls, 300, 24 * 60 * 60_000);
        session.incrementTurn(); const character = session.getNextCharacter();
        const line = await this.agentsService.callAgent(character, session.history, turn, session.consumeRedirect(), session.getMoodForCharacter(character), signal);
        signal.throwIfAborted(); session.addToHistory(character, line);
        const config = AgentsService.getCharacterConfig(character);
        yield { turn, total: 15, character, color: config.color, bgColor: config.bgColor, text: line, isFinal: turn === 15 };
        if (turn < 15) await sleep(3000, undefined, { signal });
      }
    } finally { close(); }
  }
}
