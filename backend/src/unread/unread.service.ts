import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../messages/schemas/message.schema';

@Injectable()
export class UnreadService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Mark all messages in a chat as read for a user
   */
  async markChatAsRead(userId: string, chatId: string): Promise<void> {
    console.log(`[UnreadService] Marking chat ${chatId} as read for user ${userId}`);

    const result = await this.messageModel.updateMany(
      {
        chatId: new Types.ObjectId(chatId),
        unreadBy: new Types.ObjectId(userId),
      },
      {
        $pull: { unreadBy: new Types.ObjectId(userId) },
      },
    ).exec();

    console.log(`[UnreadService] Marked ${result.modifiedCount} messages as read`);
  }

  /**
   * Get unread message counts for all chats of a user
   * Returns: { chatId: count }
   */
  async getUnreadCounts(userId: string): Promise<Record<string, number>> {
    console.log(`[UnreadService] Getting unread counts for user: ${userId}`);

    // Use aggregation to count unread messages per chat
    const results = await this.messageModel.aggregate([
      {
        $match: {
          unreadBy: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$chatId',
          count: { $sum: 1 },
        },
      },
    ]).exec();

    console.log(`[UnreadService] Aggregation results:`, results);

    const counts: Record<string, number> = {};
    results.forEach((result) => {
      counts[result._id.toString()] = result.count;
    });

    console.log(`[UnreadService] Final unread counts:`, counts);

    return counts;
  }

  /**
   * Get unread message count for a specific chat
   */
  async getUnreadCount(userId: string, chatId: string): Promise<number> {
    console.log(`[UnreadService] Getting unread count for chat ${chatId}, user ${userId}`);

    const count = await this.messageModel.countDocuments({
      chatId: new Types.ObjectId(chatId),
      unreadBy: new Types.ObjectId(userId),
    }).exec();

    console.log(`[UnreadService] Found ${count} unread messages`);

    return count;
  }
}
