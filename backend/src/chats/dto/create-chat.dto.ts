import { IsArray, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ example: ['userId1', 'userId2'], description: 'Array of participant user IDs' })
  @IsArray()
  @IsNotEmpty()
  participants: string[];

  @ApiProperty({ example: true, required: false, description: 'Whether messages in this chat can be edited' })
  @IsBoolean()
  @IsOptional()
  isMutable?: boolean;
}
