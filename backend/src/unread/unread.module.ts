import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnreadService } from './unread.service';
import { UnreadController } from './unread.controller';
import { Message, MessageSchema } from '../messages/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [UnreadController],
  providers: [UnreadService],
  exports: [UnreadService],
})
export class UnreadModule {}
