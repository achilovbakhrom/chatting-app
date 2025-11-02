import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('chats')
@Controller('chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @CurrentUser() user: any) {
    return this.chatsService.create(createChatDto, user.sub);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.chatsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatsService.findOne(id, user.sub);
  }

  @Post(':id/participants')
  inviteUser(
    @Param('id') id: string,
    @Body() inviteUserDto: InviteUserDto,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.inviteUser(id, inviteUserDto.email, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatsService.remove(id, user.sub);
  }
}
