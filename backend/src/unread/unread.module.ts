import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnreadService } from './unread.service';
import { UnreadController } from './unread.controller';
import { Unread, UnreadSchema } from './schemas/unread.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unread.name, schema: UnreadSchema }]),
  ],
  controllers: [UnreadController],
  providers: [UnreadService],
  exports: [UnreadService],
})
export class UnreadModule {}
