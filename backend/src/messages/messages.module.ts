import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message, MessageSchema } from './schemas/message.schema';
import { Bid, BidSchema } from '../bids/schemas/bid.schema';
import { ChatsModule } from '../chats/chats.module';
import { TranslationModule } from '../translation/translation.module';
import { StorageModule } from '../storage/storage.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { UnreadModule } from '../unread/unread.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Bid.name, schema: BidSchema },
    ]),
    ChatsModule,
    TranslationModule,
    StorageModule,
    WebsocketModule,
    UnreadModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
