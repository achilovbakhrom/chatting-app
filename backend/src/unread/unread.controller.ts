import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UnreadService } from './unread.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('unread')
@UseGuards(JwtAuthGuard)
export class UnreadController {
  constructor(private readonly unreadService: UnreadService) {}

  @Get()
  async getUnreadCounts(@CurrentUser() user: any) {
    const counts = await this.unreadService.getUnreadCounts(user.sub);
    return counts;
  }

  @Get(':chatId')
  async getUnreadCount(@CurrentUser() user: any, @Param('chatId') chatId: string) {
    const count = await this.unreadService.getUnreadCount(user.sub, chatId);
    return { count };
  }

  @Patch(':chatId/mark-read')
  async markAsRead(@CurrentUser() user: any, @Param('chatId') chatId: string) {
    await this.unreadService.markChatAsRead(user.sub, chatId);
    return { success: true };
  }
}
