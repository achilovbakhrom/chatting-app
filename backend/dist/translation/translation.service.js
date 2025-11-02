"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
let TranslationService = class TranslationService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new openai_1.default({ apiKey });
        }
    }
    async translate(text, from, to) {
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
        }
        catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    async detectLanguage(text) {
        if (!this.openai) {
            return 'en';
        }
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Detect the language of the following text. Return only the ISO 639-1 language code (e.g., en, es, fr, de, etc.).',
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
                temperature: 0,
            });
            return completion.choices[0]?.message?.content?.toLowerCase() || 'en';
        }
        catch (error) {
            console.error('Language detection error:', error);
            return 'en';
        }
    }
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TranslationService);
//# sourceMappingURL=translation.service.js.map