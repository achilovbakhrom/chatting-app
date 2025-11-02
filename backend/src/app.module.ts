import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { BidsModule } from './bids/bids.module';
import { StorageModule } from './storage/storage.module';
import { TranslationModule } from './translation/translation.module';
import { WebsocketModule } from './websocket/websocket.module';
import { UnreadModule } from './unread/unread.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ChatsModule,
    MessagesModule,
    BidsModule,
    StorageModule,
    TranslationModule,
    WebsocketModule,
    UnreadModule,
  ],
})
export class AppModule {}
