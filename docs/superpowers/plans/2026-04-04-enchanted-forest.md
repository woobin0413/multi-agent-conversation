# The Enchanted Forest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack app where two AI agents (Luna and Oak) tell a collaborative 15-sentence story in real time via SSE, with user pause/resume/redirect controls.

**Architecture:** NestJS backend with an async-generator-driven SSE stream, React + Vite frontend consuming the stream. All state in-memory. Groq API (`llama-3.3-70b-versatile`) powers both agents. Vite dev proxy eliminates CORS.

**Tech Stack:** NestJS, React, Vite, TypeScript, Tailwind CSS, groq-sdk, RxJS, Server-Sent Events

---

## File Map

### Backend (`backend/`)

| File | Responsibility |
|---|---|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config |
| `nest-cli.json` | NestJS CLI config |
| `.env` | `GROQ_API_KEY` |
| `src/main.ts` | Bootstrap app, port 3001, CORS |
| `src/app.module.ts` | Root module, imports StoryModule |
| `src/types/story.types.ts` | Shared TypeScript interfaces |
| `src/story/story.module.ts` | StoryModule providers |
| `src/story/story.session.ts` | StorySession state class |
| `src/story/agents.service.ts` | AgentsService — Groq wrapper |
| `src/story/story.service.ts` | StoryService — session lifecycle + stream |
| `src/story/story.controller.ts` | HTTP + SSE routes |
| `test/story.session.spec.ts` | Unit tests for StorySession |
| `test/story.service.spec.ts` | Unit tests for StoryService |

### Frontend (`frontend/`)

| File | Responsibility |
|---|---|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config |
| `tsconfig.node.json` | Node tsconfig for Vite |
| `vite.config.ts` | Vite config + proxy |
| `postcss.config.js` | PostCSS for Tailwind |
| `tailwind.config.js` | Tailwind config |
| `index.html` | HTML entry point |
| `src/main.tsx` | React entry point |
| `src/index.css` | Tailwind directives + keyframes |
| `src/types/story.types.ts` | Shared TypeScript interfaces (copy) |
| `src/hooks/useStory.ts` | Story state + SSE + API calls |
| `src/components/ProgressBar.tsx` | Turn progress bar |
| `src/components/ChatBubble.tsx` | Sentence bubble + typewriter |
| `src/components/StoryDisplay.tsx` | Scrollable sentence list |
| `src/components/Controls.tsx` | Start/Pause/Resume/Reset buttons |
| `src/components/RedirectInput.tsx` | Redirect text input |
| `src/App.tsx` | Root layout |

---

## Task 1: Backend Project Scaffolding

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nest-cli.json`
- Create: `backend/.env`
- Create: `backend/src/main.ts`
- Create: `backend/src/app.module.ts`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "enchanted-forest-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/mapped-types": "^2.0.6",
    "@nestjs/platform-express": "^10.4.15",
    "dotenv": "^16.4.7",
    "groq-sdk": "^0.8.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.9",
    "@nestjs/testing": "^10.4.15",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.10.5",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- [ ] **Step 3: Create `backend/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create `backend/.env`**

```
GROQ_API_KEY=your_key_here
```

- [ ] **Step 5: Create `backend/src/main.ts`**

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:5173' });
  await app.listen(3001);
}
bootstrap();
```

- [ ] **Step 6: Create `backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { StoryModule } from './story/story.module';

@Module({
  imports: [StoryModule],
})
export class AppModule {}
```

- [ ] **Step 7: Install dependencies**

Run: `cd backend && npm install`
Expected: `node_modules/` directory created, no errors.

- [ ] **Step 8: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/tsconfig.json backend/nest-cli.json backend/.env backend/src/main.ts backend/src/app.module.ts
git commit -m "feat: scaffold NestJS backend project"
```

---

## Task 2: Shared Types (Backend)

**Files:**
- Create: `backend/src/types/story.types.ts`

- [ ] **Step 1: Create `backend/src/types/story.types.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/types/story.types.ts
git commit -m "feat: add shared story types for backend"
```

---

## Task 3: StorySession Class

**Files:**
- Create: `backend/src/story/story.session.ts`
- Create: `backend/test/story.session.spec.ts`

- [ ] **Step 1: Write failing tests for StorySession**

Create `backend/test/story.session.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx jest test/story.session.spec.ts --verbose`
Expected: FAIL — `Cannot find module '../src/story/story.session'`

- [ ] **Step 3: Implement StorySession**

Create `backend/src/story/story.session.ts`:

```ts
export class StorySession {
  public sessionId: string;
  public history: Array<{ role: string; content: string }>;
  public currentTurn: number;
  public isPaused: boolean;
  public isComplete: boolean;
  public pendingRedirect: string | null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.history = [];
    this.currentTurn = 0;
    this.isPaused = false;
    this.isComplete = false;
    this.pendingRedirect = null;
  }

  getNextCharacter(): 'Luna' | 'Oak' {
    return this.currentTurn % 2 === 1 ? 'Luna' : 'Oak';
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

  addToHistory(character: string, line: string): void {
    this.history.push({ role: 'assistant', content: `${character}: ${line}` });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx jest test/story.session.spec.ts --verbose`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/story/story.session.ts backend/test/story.session.spec.ts
git commit -m "feat: add StorySession class with unit tests"
```

---

## Task 4: AgentsService

**Files:**
- Create: `backend/src/story/agents.service.ts`

- [ ] **Step 1: Create AgentsService**

Create `backend/src/story/agents.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

interface CharacterConfig {
  name: 'Luna' | 'Oak';
  color: string;
  bgColor: string;
  systemPrompt: string;
}

const CHARACTERS: Record<'Luna' | 'Oak', CharacterConfig> = {
  Luna: {
    name: 'Luna',
    color: '#3C3489',
    bgColor: '#EEEDFE',
    systemPrompt:
      'You are Luna, a curious young wizard exploring an enchanted forest. You are speaking with Oak, an ancient talking tree. Speak ONE sentence only per turn. Stay in character. React to what Oak just said. Be vivid and expressive. Never write more than one sentence. No quotation marks around your response.',
  },
  Oak: {
    name: 'Oak',
    color: '#27500A',
    bgColor: '#EAF3DE',
    systemPrompt:
      'You are Oak, an ancient talking tree, 500 years old, wise, slow, and mysterious. You are speaking with Luna, a young wizard who entered your forest. Speak ONE sentence only per turn. Stay in character. React to what Luna just said. Reveal forest secrets gradually. Never write more than one sentence. No quotation marks around your response.',
  },
};

@Injectable()
export class AgentsService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async callAgent(
    character: 'Luna' | 'Oak',
    history: Array<{ role: string; content: string }>,
    turn: number,
    redirect: string | null,
  ): Promise<string> {
    const config = CHARACTERS[character];

    let systemPrompt = config.systemPrompt;
    if (turn === 13) {
      systemPrompt +=
        ' This is your second to last line. Begin wrapping the story toward a close.';
    }
    if (turn === 15) {
      systemPrompt +=
        ' This is your FINAL line. End the story with a beautiful closing sentence.';
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history,
    ];

    if (redirect) {
      messages.push({
        role: 'user',
        content: `Story change: ${redirect}. Continue naturally.`,
      });
    }

    messages.push({ role: 'user', content: 'Your turn. One sentence only.' });

    try {
      return await this.sendRequest(messages);
    } catch {
      await this.sleep(1000);
      return await this.sendRequest(messages);
    }
  }

  private async sendRequest(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 80,
      temperature: 0.8,
      messages: messages as any,
    });

    const text = response.choices[0]?.message?.content ?? '';
    return text.trim().replace(/^["']+|["']+$/g, '');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static getCharacterConfig(character: 'Luna' | 'Oak'): CharacterConfig {
    return CHARACTERS[character];
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd backend && npx tsc --noEmit src/story/agents.service.ts`
Expected: No errors (some warnings about imports are OK at this stage since the full project isn't wired yet).

- [ ] **Step 3: Commit**

```bash
git add backend/src/story/agents.service.ts
git commit -m "feat: add AgentsService with Groq integration"
```

---

## Task 5: StoryService

**Files:**
- Create: `backend/src/story/story.service.ts`
- Create: `backend/test/story.service.spec.ts`

- [ ] **Step 1: Write failing tests for StoryService**

Create `backend/test/story.service.spec.ts`:

```ts
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
      const session = service.createSession();
      expect(session.sessionId).toBeDefined();
      expect(session.sessionId.length).toBeGreaterThan(0);
      expect(session.currentTurn).toBe(0);
    });
  });

  describe('getSession', () => {
    it('returns an existing session', () => {
      const created = service.createSession();
      const fetched = service.getSession(created.sessionId);
      expect(fetched.sessionId).toBe(created.sessionId);
    });

    it('throws NotFoundException for unknown sessionId', () => {
      expect(() => service.getSession('nonexistent')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('pauseSession / resumeSession', () => {
    it('toggles isPaused', () => {
      const session = service.createSession();
      service.pauseSession(session.sessionId);
      expect(session.isPaused).toBe(true);
      service.resumeSession(session.sessionId);
      expect(session.isPaused).toBe(false);
    });
  });

  describe('redirectSession', () => {
    it('sets pendingRedirect on the session', () => {
      const session = service.createSession();
      service.redirectSession(session.sessionId, 'add a dragon');
      expect(session.pendingRedirect).toBe('add a dragon');
    });
  });

  describe('streamStory', () => {
    it('yields 15 StoryEvents', async () => {
      const session = service.createSession();
      const events = [];
      for await (const event of service.streamStory(session.sessionId)) {
        events.push(event);
      }
      expect(events).toHaveLength(15);
      expect(events[0].turn).toBe(1);
      expect(events[0].character).toBe('Luna');
      expect(events[14].turn).toBe(15);
      expect(events[14].isFinal).toBe(true);
      expect(session.isComplete).toBe(true);
    }, 30000);

    it('alternates between Luna and Oak', async () => {
      const session = service.createSession();
      const characters: string[] = [];
      for await (const event of service.streamStory(session.sessionId)) {
        characters.push(event.character);
      }
      expect(characters[0]).toBe('Luna');
      expect(characters[1]).toBe('Oak');
      expect(characters[2]).toBe('Luna');
    }, 30000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx jest test/story.service.spec.ts --verbose`
Expected: FAIL — `Cannot find module '../src/story/story.service'`

- [ ] **Step 3: Implement StoryService**

Create `backend/src/story/story.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StorySession } from './story.session';
import { AgentsService } from './agents.service';
import { StoryEvent } from '../types/story.types';

@Injectable()
export class StoryService {
  private sessions = new Map<string, StorySession>();

  constructor(private readonly agentsService: AgentsService) {}

  createSession(): StorySession {
    const sessionId = randomUUID();
    const session = new StorySession(sessionId);
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): StorySession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    return session;
  }

  pauseSession(sessionId: string): void {
    this.getSession(sessionId).isPaused = true;
  }

  resumeSession(sessionId: string): void {
    this.getSession(sessionId).isPaused = false;
  }

  redirectSession(sessionId: string, message: string): void {
    this.getSession(sessionId).injectRedirect(message);
  }

  async *streamStory(sessionId: string): AsyncGenerator<StoryEvent> {
    const session = this.getSession(sessionId);

    session.history.push({
      role: 'user',
      content:
        'The story begins. Luna has just stepped into the enchanted forest and notices a massive ancient tree with a face in its bark. Begin the story.',
    });

    for (let turn = 1; turn <= 15; turn++) {
      session.incrementTurn();
      const character = session.getNextCharacter();
      const redirect = session.consumeRedirect();

      while (session.isPaused) {
        await this.sleep(300);
      }

      const line = await this.agentsService.callAgent(
        character,
        session.history,
        turn,
        redirect,
      );

      session.addToHistory(character, line);

      const config = AgentsService.getCharacterConfig(character);

      yield {
        turn,
        total: 15,
        character,
        color: config.color,
        bgColor: config.bgColor,
        text: line,
        isFinal: turn === 15,
      };

      if (turn < 15) {
        await this.sleep(600);
      }
    }

    session.isComplete = true;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx jest test/story.service.spec.ts --verbose`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/story/story.service.ts backend/test/story.service.spec.ts
git commit -m "feat: add StoryService with session management and story streaming"
```

---

## Task 6: StoryController and StoryModule

**Files:**
- Create: `backend/src/story/story.controller.ts`
- Create: `backend/src/story/story.module.ts`

- [ ] **Step 1: Create StoryController**

Create `backend/src/story/story.controller.ts`:

```ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Sse,
} from '@nestjs/common';
import { Observable, from, map } from 'rxjs';
import { Readable } from 'stream';
import { StoryService } from './story.service';
import { RedirectPayload, StoryStatus } from '../types/story.types';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post('start')
  start() {
    const session = this.storyService.createSession();
    return { sessionId: session.sessionId };
  }

  @Sse('stream/:sessionId')
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    const generator = this.storyService.streamStory(sessionId);
    const readable = Readable.from(generator);
    return from(readable).pipe(
      map((event) => ({ data: event }) as any),
    );
  }

  @Post('pause/:sessionId')
  pause(@Param('sessionId') sessionId: string) {
    this.storyService.pauseSession(sessionId);
    return { success: true };
  }

  @Post('resume/:sessionId')
  resume(@Param('sessionId') sessionId: string) {
    this.storyService.resumeSession(sessionId);
    return { success: true };
  }

  @Post('redirect/:sessionId')
  redirect(
    @Param('sessionId') sessionId: string,
    @Body() body: RedirectPayload,
  ) {
    this.storyService.redirectSession(sessionId, body.message);
    return { success: true };
  }

  @Get('status/:sessionId')
  status(@Param('sessionId') sessionId: string): StoryStatus {
    const session = this.storyService.getSession(sessionId);
    return {
      sessionId: session.sessionId,
      currentTurn: session.currentTurn,
      isPaused: session.isPaused,
      isComplete: session.isComplete,
    };
  }
}
```

- [ ] **Step 2: Create StoryModule**

Create `backend/src/story/story.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { AgentsService } from './agents.service';

@Module({
  controllers: [StoryController],
  providers: [StoryService, AgentsService],
})
export class StoryModule {}
```

- [ ] **Step 3: Verify backend compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify backend starts**

Run: `cd backend && npx nest start` (stop after successful startup message)
Expected: Output includes `Nest application successfully started` or listening on port 3001.

- [ ] **Step 5: Commit**

```bash
git add backend/src/story/story.controller.ts backend/src/story/story.module.ts
git commit -m "feat: add StoryController with SSE streaming and StoryModule"
```

---

## Task 7: Frontend Project Scaffolding

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/vite-env.d.ts`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "enchanted-forest-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.3",
    "vite": "^6.0.7"
  }
}
```

- [ ] **Step 2: Create `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `frontend/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/story': 'http://localhost:3001',
    },
  },
});
```

- [ ] **Step 5: Create `frontend/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create `frontend/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 7: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Enchanted Forest</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `frontend/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: Create `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-bubble-in {
  animation: bubbleIn 0.3s ease;
}

.animate-fade-in {
  animation: fadeIn 1s ease;
}
```

- [ ] **Step 10: Create `frontend/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 11: Create placeholder `frontend/src/App.tsx`**

```tsx
function App() {
  return <div className="text-center p-8">Enchanted Forest — loading...</div>;
}

export default App;
```

- [ ] **Step 12: Install dependencies**

Run: `cd frontend && npm install`
Expected: `node_modules/` directory created, no errors.

- [ ] **Step 13: Verify frontend starts**

Run: `cd frontend && npx vite --host` (stop after seeing "Local: http://localhost:5173/")
Expected: Vite starts successfully.

- [ ] **Step 14: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React + Vite frontend with Tailwind CSS"
```

---

## Task 8: Shared Types (Frontend)

**Files:**
- Create: `frontend/src/types/story.types.ts`

- [ ] **Step 1: Create `frontend/src/types/story.types.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/story.types.ts
git commit -m "feat: add shared story types for frontend"
```

---

## Task 9: useStory Hook

**Files:**
- Create: `frontend/src/hooks/useStory.ts`

- [ ] **Step 1: Create `frontend/src/hooks/useStory.ts`**

```ts
import { useState, useRef, useCallback } from 'react';
import { StoryEvent } from '../types/story.types';

export function useStory() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sentences, setSentences] = useState<StoryEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [status, setStatus] = useState('Ready to begin');
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStory = useCallback(async () => {
    const res = await fetch('/story/start', { method: 'POST' });
    const { sessionId: newSessionId } = await res.json();

    setSessionId(newSessionId);
    setSentences([]);
    setIsComplete(false);
    setIsPaused(false);
    setCurrentTurn(0);
    setStatus('Starting story...');

    const es = new EventSource(`/story/stream/${newSessionId}`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const data: StoryEvent = JSON.parse(e.data);
      setSentences((prev) => [...prev, data]);
      setCurrentTurn(data.turn);
      setStatus(`${data.character} is speaking...`);

      if (data.isFinal) {
        setIsComplete(true);
        setStatus('The story is complete');
        es.close();
        eventSourceRef.current = null;
      }
    };

    es.onerror = () => {
      setStatus('Connection lost');
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  const pauseStory = useCallback(async () => {
    if (!sessionId) return;
    await fetch(`/story/pause/${sessionId}`, { method: 'POST' });
    setIsPaused(true);
    setStatus('Paused');
  }, [sessionId]);

  const resumeStory = useCallback(async () => {
    if (!sessionId) return;
    await fetch(`/story/resume/${sessionId}`, { method: 'POST' });
    setIsPaused(false);
    setStatus('Resuming...');
  }, [sessionId]);

  const redirectStory = useCallback(
    async (message: string) => {
      if (!sessionId) return;
      await fetch(`/story/redirect/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      setStatus('Redirect queued for next turn');
    },
    [sessionId],
  );

  const resetStory = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSessionId(null);
    setSentences([]);
    setIsPaused(false);
    setIsComplete(false);
    setCurrentTurn(0);
    setStatus('Ready to begin');
  }, []);

  const hasStarted = sessionId !== null;

  return {
    sessionId,
    sentences,
    isPaused,
    isComplete,
    currentTurn,
    status,
    hasStarted,
    startStory,
    pauseStory,
    resumeStory,
    redirectStory,
    resetStory,
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors (App.tsx doesn't import it yet, but the file itself is valid)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useStory.ts
git commit -m "feat: add useStory hook with SSE and story controls"
```

---

## Task 10: ProgressBar Component

**Files:**
- Create: `frontend/src/components/ProgressBar.tsx`

- [ ] **Step 1: Create `frontend/src/components/ProgressBar.tsx`**

```tsx
interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const percent = (current / total) * 100;

  return (
    <div className="mb-4">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percent}%`, backgroundColor: '#7F77DD' }}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Sentence {current} of {total}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ProgressBar.tsx
git commit -m "feat: add ProgressBar component"
```

---

## Task 11: ChatBubble Component

**Files:**
- Create: `frontend/src/components/ChatBubble.tsx`

- [ ] **Step 1: Create `frontend/src/components/ChatBubble.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { StoryEvent } from '../types/story.types';

interface Props {
  event: StoryEvent;
}

export function ChatBubble({ event }: Props) {
  const [displayed, setDisplayed] = useState('');
  const words = event.text.split(' ');
  const isLuna = event.character === 'Luna';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(words.slice(0, i).join(' '));
      if (i >= words.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [event.text]);

  return (
    <div
      className={`flex ${isLuna ? 'justify-start' : 'justify-end'} mb-3 animate-bubble-in`}
    >
      <div
        className="max-w-[80%] px-4 py-3"
        style={{
          backgroundColor: event.bgColor,
          color: event.color,
          borderRadius: isLuna
            ? '12px 12px 12px 0'
            : '12px 12px 0 12px',
        }}
      >
        <p className="text-xs font-bold mb-1">{event.character}</p>
        <p className="text-sm leading-relaxed">{displayed}</p>
        <p className="text-xs mt-1 opacity-50">
          Sentence {event.turn} of {event.total}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ChatBubble.tsx
git commit -m "feat: add ChatBubble component with typewriter effect"
```

---

## Task 12: StoryDisplay Component

**Files:**
- Create: `frontend/src/components/StoryDisplay.tsx`

- [ ] **Step 1: Create `frontend/src/components/StoryDisplay.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { StoryEvent } from '../types/story.types';
import { ChatBubble } from './ChatBubble';

interface Props {
  sentences: StoryEvent[];
  isComplete: boolean;
}

export function StoryDisplay({ sentences, isComplete }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sentences]);

  if (sentences.length === 0) {
    return null;
  }

  return (
    <div className="max-h-[480px] overflow-y-auto mb-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {sentences.map((event) => (
        <ChatBubble key={event.turn} event={event} />
      ))}
      {isComplete && (
        <p className="text-center italic text-gray-400 dark:text-gray-500 mt-4 animate-fade-in">
          ~ The End ~
        </p>
      )}
      <div ref={endRef} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/StoryDisplay.tsx
git commit -m "feat: add StoryDisplay component with auto-scroll"
```

---

## Task 13: Controls Component

**Files:**
- Create: `frontend/src/components/Controls.tsx`

- [ ] **Step 1: Create `frontend/src/components/Controls.tsx`**

```tsx
interface Props {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isPaused: boolean;
  isComplete: boolean;
  hasStarted: boolean;
  status: string;
}

export function Controls({
  onStart,
  onPause,
  onResume,
  onReset,
  isPaused,
  isComplete,
  hasStarted,
  status,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={onStart}
          disabled={hasStarted && !isComplete}
          className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#7F77DD' }}
        >
          Begin Story
        </button>
        <button
          onClick={onPause}
          disabled={isPaused || isComplete || !hasStarted}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Pause
        </button>
        <button
          onClick={onResume}
          disabled={!isPaused || isComplete}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Resume
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      <p
        key={status}
        className="text-center text-sm italic text-gray-500 dark:text-gray-400 mt-2 animate-fade-in"
      >
        {status}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Controls.tsx
git commit -m "feat: add Controls component with button states"
```

---

## Task 14: RedirectInput Component

**Files:**
- Create: `frontend/src/components/RedirectInput.tsx`

- [ ] **Step 1: Create `frontend/src/components/RedirectInput.tsx`**

```tsx
import { useState } from 'react';

interface Props {
  onRedirect: (message: string) => void;
  disabled: boolean;
}

export function RedirectInput({ onRedirect, disabled }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onRedirect(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Change the story... e.g. make a dragon appear"
        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <button
        onClick={submit}
        disabled={disabled}
        className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#7F77DD' }}
      >
        Redirect
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/RedirectInput.tsx
git commit -m "feat: add RedirectInput component"
```

---

## Task 15: App.tsx — Full Layout

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Replace `frontend/src/App.tsx` with full layout**

```tsx
import { useStory } from './hooks/useStory';
import { ProgressBar } from './components/ProgressBar';
import { StoryDisplay } from './components/StoryDisplay';
import { Controls } from './components/Controls';
import { RedirectInput } from './components/RedirectInput';

function App() {
  const {
    sentences,
    isPaused,
    isComplete,
    currentTurn,
    status,
    hasStarted,
    startStory,
    pauseStory,
    resumeStory,
    resetStory,
    redirectStory,
  } = useStory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-[680px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">The Enchanted Forest</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Two AI agents telling a story, 15 sentences
          </p>
          <div className="flex justify-center gap-3">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
            >
              <span className="font-bold">Luna</span>
              <span className="opacity-70">Curious young wizard</span>
            </span>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#EAF3DE', color: '#27500A' }}
            >
              <span className="font-bold">Oak</span>
              <span className="opacity-70">Ancient talking tree</span>
            </span>
          </div>
        </div>

        {/* Progress */}
        {currentTurn > 0 && (
          <ProgressBar current={currentTurn} total={15} />
        )}

        {/* Story */}
        <StoryDisplay sentences={sentences} isComplete={isComplete} />

        {/* Controls */}
        <Controls
          onStart={startStory}
          onPause={pauseStory}
          onResume={resumeStory}
          onReset={resetStory}
          isPaused={isPaused}
          isComplete={isComplete}
          hasStarted={hasStarted}
          status={status}
        />

        {/* Redirect */}
        <RedirectInput
          onRedirect={redirectStory}
          disabled={!hasStarted || isComplete}
        />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Verify frontend compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: wire up App.tsx with all components and useStory hook"
```

---

## Task 16: End-to-End Verification

- [ ] **Step 1: Set GROQ_API_KEY**

Edit `backend/.env` and replace `your_key_here` with a real Groq API key.

- [ ] **Step 2: Start backend**

Run: `cd backend && npm run start:dev`
Expected: `Nest application successfully started` on port 3001

- [ ] **Step 3: Start frontend (separate terminal)**

Run: `cd frontend && npm run dev`
Expected: Vite running at `http://localhost:5173`

- [ ] **Step 4: Test happy path**

Open `http://localhost:5173` in a browser.
- Click "Begin Story"
- Verify: sentences appear one by one, alternating Luna (left, purple) and Oak (right, green)
- Verify: progress bar fills as sentences arrive
- Verify: typewriter effect visible on each bubble
- Verify: after sentence 15, "~ The End ~" appears
- Verify: status text updates throughout

- [ ] **Step 5: Test pause/resume**

Start a new story (click Reset, then Begin Story).
- After 3-4 sentences, click "Pause"
- Verify: no new sentences appear, status shows "Paused"
- Wait a few seconds, click "Resume"
- Verify: sentences continue from where they stopped

- [ ] **Step 6: Test redirect**

Start a new story.
- After 2-3 sentences, type "make a dragon appear" in the redirect input and press Enter
- Verify: status shows "Redirect queued for next turn"
- Verify: the next sentence naturally incorporates the dragon

- [ ] **Step 7: Test reset**

Click "Reset" mid-story.
- Verify: all sentences cleared, progress bar gone, status "Ready to begin"
- Click "Begin Story" again
- Verify: fresh story starts

- [ ] **Step 8: Run backend unit tests**

Run: `cd backend && npm test`
Expected: All tests pass

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: complete Enchanted Forest story app"
```
