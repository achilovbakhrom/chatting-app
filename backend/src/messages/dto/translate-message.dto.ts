import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateMessageDto {
  @ApiProperty({ example: 'es', description: 'Target language code (ISO 639-1)' })
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;
}
