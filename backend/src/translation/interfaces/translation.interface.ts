export interface ITranslationService {
  translate(text: string, from: string, to: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
}
