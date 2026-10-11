import { Controller, Post, Get, Param, Body, Sse, Req, Res, MessageEvent, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Observable } from 'rxjs';
import { StoryService } from './story.service';
import { RedirectPayload, MoodPayload, StoryStatus } from '../types/story.types';
type LocalRequest = { headers: { cookie?: string } };
type LocalResponse = { setHeader(name: string, value: string): void };
function owner(request: LocalRequest): string {
  const token = request.headers.cookie?.match(/(?:^|;\s*)story_owner=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) throw new NotFoundException();
  return token;
}
@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}
  @Post('start')
  start(@Req() request: LocalRequest, @Res({ passthrough: true }) response: LocalResponse) {
    let token: string;
    try { token = owner(request); } catch { token = randomBytes(32).toString('hex'); }
    const session = this.storyService.createSession(token);
    response.setHeader('Set-Cookie', `story_owner=${token}; HttpOnly; SameSite=Strict; Path=/story; Max-Age=1800`);
    return { sessionId: session.sessionId };
  }
  @Sse('stream/:sessionId')
  stream(@Param('sessionId') id: string, @Req() request: LocalRequest): Observable<MessageEvent> {
    const stream = this.storyService.openStream(id, owner(request));
    return new Observable(subscriber => {
      void (async () => {
        try {
          for await (const event of stream.events) { if (subscriber.closed) break; subscriber.next({ data: event }); }
          subscriber.complete();
        } catch { if (!subscriber.closed) subscriber.complete(); }
      })();
      return () => stream.close();
    });
  }
  @Post('pause/:sessionId')
  pause(@Param('sessionId') id: string, @Req() request: LocalRequest) { this.storyService.pauseSession(id, owner(request)); return { success: true }; }
  @Post('resume/:sessionId')
  resume(@Param('sessionId') id: string, @Req() request: LocalRequest) { this.storyService.resumeSession(id, owner(request)); return { success: true }; }
  @Post('redirect/:sessionId')
  redirect(@Param('sessionId') id: string, @Req() request: LocalRequest, @Body() body: RedirectPayload) { this.storyService.redirectSession(id, owner(request), body?.message); return { success: true }; }
  @Post('mood/:sessionId')
  mood(@Param('sessionId') id: string, @Req() request: LocalRequest, @Body() body: MoodPayload) { this.storyService.setMoods(id, owner(request), body?.lunaMood, body?.oakMood); return { success: true }; }
  @Get('status/:sessionId')
  status(@Param('sessionId') id: string, @Req() request: LocalRequest): StoryStatus {
    const session = this.storyService.getSession(id, owner(request));
    return { sessionId: session.sessionId, currentTurn: session.currentTurn, isPaused: session.isPaused, isComplete: session.isComplete };
  }
}
