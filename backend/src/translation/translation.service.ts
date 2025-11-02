import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ITranslationService } from './interfaces/translation.interface';

@Injectable()
export class TranslationService implements ITranslationService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text from ${from} to ${to}. Only return the translated text, nothing else.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.openai) {
      return 'en'; // Default to English if no API key
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Detect the language of the following text. Return only the ISO 639-1 language code (e.g., en, es, fr, de, etc.).',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0,
      });

      return completion.choices[0]?.message?.content?.toLowerCase() || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }
}
