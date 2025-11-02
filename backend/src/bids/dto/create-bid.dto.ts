import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({ example: 'chatId123' })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({ example: 1500, description: 'Bid amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'Delivery within 3 days', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'userId123', description: 'User ID the bid is addressed to' })
  @IsString()
  @IsNotEmpty()
  addressedTo: string;
}
