import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { TranslateMessageDto } from './dto/translate-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.messagesService.create(createMessageDto, user.sub, file);
  }

  @Get('chat/:chatId')
  findAllByChat(
    @Param('chatId') chatId: string,
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.findAllByChat(chatId, user.sub, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.update(id, updateMessageDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.remove(id, user.sub);
  }

  @Post(':id/translate')
  async translate(
    @Param('id') id: string,
    @Body() translateDto: TranslateMessageDto,
    @CurrentUser() user: any,
  ) {
    const translatedText = await this.messagesService.translateMessage(
      id,
      translateDto.targetLanguage,
      user.sub,
    );
    return { translatedText };
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const message = await this.messagesService.findOne(id, user.sub);
    const fileBuffer = await this.messagesService.downloadFile(id, user.sub);

    res.setHeader('Content-Type', message.fileMetadata.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${message.fileMetadata.originalName}"`,
    );
    res.send(fileBuffer);
  }
}
