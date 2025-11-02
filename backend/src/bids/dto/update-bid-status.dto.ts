import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BidStatus } from '../../common/enums';

export class UpdateBidStatusDto {
  @ApiProperty({ enum: BidStatus, example: BidStatus.ACCEPTED })
  @IsEnum(BidStatus)
  status: BidStatus;
}
