import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AiPromptBuilder } from './ai.prompt.builder';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateAnswer(question: string, style: string): Promise<string> {
    const prompt = AiPromptBuilder.build(question, style);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',

      messages: [
        {
          role: 'system',
          content: '너는 어린이 질문에 답해주는 친절한 선생님이다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],

      max_tokens: 200,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content ?? '';
  }
}
