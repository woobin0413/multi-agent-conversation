import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface CharacterConfig {
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
      'You are Luna, a friendly and curious person meeting Oak for the first time. Start by greeting Oak warmly. You can talk about anything — life, ideas, dreams, funny stories, whatever feels natural. Speak ONE sentence only per turn. You MUST directly acknowledge and respond to what Oak just said before adding anything new. Do not prefix your response with your name. No quotation marks around your response.',
  },
  Oak: {
    name: 'Oak',
    color: '#27500A',
    bgColor: '#EAF3DE',
    systemPrompt:
      'You are Oak, a warm and thoughtful person meeting Luna for the first time. Start by greeting Luna back. You can talk about anything — life, ideas, dreams, funny stories, whatever feels natural. Speak ONE sentence only per turn. You MUST directly acknowledge and respond to what Luna just said before adding anything new. Do not prefix your response with your name. No quotation marks around your response.',
  },
};

@Injectable()
export class AgentsService {
  private groq: Groq;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 15_000, maxRetries: 0 });
  }

  async callAgent(
    character: 'Luna' | 'Oak',
    history: Array<{ role: string; content: string }>,
    turn: number,
    redirect: string | null,
    mood: string | null,
    signal?: AbortSignal,
  ): Promise<string> {
    const config = CHARACTERS[character];

    let systemPrompt = config.systemPrompt;
    if (mood) {
      systemPrompt += ` Speak in a ${mood} tone and personality. Let this mood strongly influence how you express yourself.`;
    }
    if (turn === 13) {
      systemPrompt +=
        ' This is your second to last line. Begin wrapping the conversation toward a close.';
    }
    if (turn === 15) {
      systemPrompt +=
        ' This is your FINAL line. End the conversation with a warm closing sentence.';
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...(history as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>),
    ];

    if (redirect) {
      messages.push({
        role: 'user',
        content: `Story change: ${redirect}. Continue naturally.`,
      });
    }

    messages.push({ role: 'user', content: 'Your turn. One sentence only.' });

    return this.sendRequest(messages, signal);
  }

  private async sendRequest(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    signal?: AbortSignal,
  ): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 80,
      temperature: 0.8,
      messages: messages as any,
    }, { signal });

    const text = response.choices[0]?.message?.content ?? '';
    return text.trim().replace(/^["']+|["']+$/g, '').replace(/^(Luna|Oak):\s*/i, '');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static getCharacterConfig(character: 'Luna' | 'Oak'): CharacterConfig {
    return CHARACTERS[character];
  }
}
