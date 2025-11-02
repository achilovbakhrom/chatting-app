import { ConfigService } from '@nestjs/config';
import { ITranslationService } from './interfaces/translation.interface';
export declare class TranslationService implements ITranslationService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    translate(text: string, from: string, to: string): Promise<string>;
    detectLanguage(text: string): Promise<string>;
}
