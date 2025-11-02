import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({ example: 'Updated message content' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
