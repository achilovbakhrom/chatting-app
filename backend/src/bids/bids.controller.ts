import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('bids')
@Controller('bids')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(@Body() createBidDto: CreateBidDto, @CurrentUser() user: any) {
    return this.bidsService.create(createBidDto, user.sub);
  }

  @Get('chat/:chatId')
  findAllByChat(@Param('chatId') chatId: string, @CurrentUser() user: any) {
    return this.bidsService.findAllByChat(chatId, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.findOne(id, user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateBidStatusDto: UpdateBidStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.bidsService.updateStatus(id, updateBidStatusDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.remove(id, user.sub);
  }
}
