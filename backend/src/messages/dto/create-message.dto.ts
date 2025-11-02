import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../../common/enums';

export class CreateMessageDto {
  @ApiProperty({ example: 'chatId123' })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({ enum: MessageType, example: MessageType.TEXT })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ example: 'Hello, world!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'messageId123', required: false })
  @IsString()
  @IsOptional()
  replyTo?: string;
}
