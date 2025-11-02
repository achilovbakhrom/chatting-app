import { Controller, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { UnreadService } from './unread.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('unread')
@UseGuards(JwtAuthGuard)
export class UnreadController {
  constructor(private readonly unreadService: UnreadService) {}

  @Get()
  async getUnreadCounts(@Request() req) {
    return this.unreadService.getUnreadCounts(req.user.userId);
  }

  @Get(':chatId')
  async getUnreadCount(@Request() req, @Param('chatId') chatId: string) {
    return {
      count: await this.unreadService.getUnreadCount(req.user.userId, chatId),
    };
  }

  @Patch(':chatId/clear')
  async clearUnread(@Request() req, @Param('chatId') chatId: string) {
    await this.unreadService.clear(req.user.userId, chatId);
    return { success: true };
  }
}
