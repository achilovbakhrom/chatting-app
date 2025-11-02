import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Unread, UnreadDocument } from './schemas/unread.schema';

@Injectable()
export class UnreadService {
  constructor(
    @InjectModel(Unread.name) private unreadModel: Model<UnreadDocument>,
  ) {}

  async increment(userId: string, chatId: string): Promise<void> {
    await this.unreadModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
      },
      {
        $inc: { count: 1 },
      },
      {
        upsert: true,
        new: true,
      },
    ).exec();
  }

  async clear(userId: string, chatId: string): Promise<void> {
    await this.unreadModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
      },
      {
        count: 0,
      },
      {
        upsert: true,
      },
    ).exec();
  }

  async getUnreadCounts(userId: string): Promise<Record<string, number>> {
    const unreads = await this.unreadModel
      .find({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    const counts: Record<string, number> = {};
    unreads.forEach((unread) => {
      counts[unread.chatId.toString()] = unread.count;
    });

    return counts;
  }

  async getUnreadCount(userId: string, chatId: string): Promise<number> {
    const unread = await this.unreadModel
      .findOne({
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
      })
      .lean()
      .exec();

    return unread?.count || 0;
  }
}
