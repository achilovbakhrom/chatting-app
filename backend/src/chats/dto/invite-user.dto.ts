import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of user to invite to the chat' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
