import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private usersService: UsersService,
  ) {}

  async create(createChatDto: CreateChatDto, userId: string): Promise<Chat> {
    const participantIds = [
      ...createChatDto.participants.map((id) => new Types.ObjectId(id)),
      new Types.ObjectId(userId),
    ];

    // Remove duplicates
    const uniqueParticipants = Array.from(
      new Set(participantIds.map((id) => id.toString())),
    ).map((id) => new Types.ObjectId(id));

    const chat = new this.chatModel({
      participants: uniqueParticipants,
      isMutable: createChatDto.isMutable ?? true,
      createdBy: new Types.ObjectId(userId),
    });

    return chat.save();
  }

  async findAll(userId: string): Promise<any[]> {
    // Use aggregation to avoid N+1 queries
    const chats = await this.chatModel.aggregate([
      // Match chats where user is a participant
      {
        $match: { participants: new Types.ObjectId(userId) }
      },
      // Sort by most recent
      {
        $sort: { updatedAt: -1 }
      },
      // Lookup participants
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantDocs'
        }
      },
      // Lookup createdBy
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByDoc'
        }
      },
      // Lookup lastMessage
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          as: 'lastMessageDoc'
        }
      },
      // Unwind lastMessage (optional since it may not exist)
      {
        $unwind: {
          path: '$lastMessageDoc',
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup lastMessage sender
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessageDoc.senderId',
          foreignField: '_id',
          as: 'lastMessageSenderDoc'
        }
      },
      // Project the final structure
      {
        $project: {
          _id: 1,
          isMutable: 1,
          createdAt: 1,
          updatedAt: 1,
          participants: {
            $map: {
              input: '$participantDocs',
              as: 'user',
              in: {
                _id: '$$user._id',
                id: '$$user._id',
                name: '$$user.name',
                email: '$$user.email',
                role: '$$user.role'
              }
            }
          },
          createdBy: {
            $let: {
              vars: { creator: { $arrayElemAt: ['$createdByDoc', 0] } },
              in: {
                _id: '$$creator._id',
                name: '$$creator.name',
                email: '$$creator.email',
                role: '$$creator.role'
              }
            }
          },
          lastMessage: {
            $cond: {
              if: { $ifNull: ['$lastMessageDoc', false] },
              then: {
                _id: '$lastMessageDoc._id',
                content: '$lastMessageDoc.content',
                type: '$lastMessageDoc.type',
                createdAt: '$lastMessageDoc.createdAt',
                senderId: {
                  $let: {
                    vars: { sender: { $arrayElemAt: ['$lastMessageSenderDoc', 0] } },
                    in: {
                      _id: '$$sender._id',
                      name: '$$sender.name'
                    }
                  }
                }
              },
              else: null
            }
          }
        }
      }
    ]).exec();

    return chats;
  }

  async findOne(id: string, userId: string): Promise<any> {
    const chat = await this.chatModel
      .findById(id)
      .exec();

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    // Manually populate participants
    const participantUsers = await Promise.all(
      chat.participants.map(async (participantId) => {
        return await this.usersService.findOne(participantId.toString());
      }),
    );

    const createdByUser = await this.usersService.findOne(chat.createdBy.toString());

    return {
      _id: chat._id,
      participants: participantUsers.map((u: any) => ({ _id: u._id, id: u._id, name: u.name, email: u.email, role: u.role })),
      isMutable: chat.isMutable,
      createdBy: { _id: (createdByUser as any)._id, name: createdByUser.name, email: createdByUser.email, role: createdByUser.role },
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }

  async inviteUser(chatId: string, userEmail: string, requestUserId: string): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId).exec();

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    // Check if requester is a participant
    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === requestUserId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    // Find user by email
    const userToInvite = await this.usersService.findByEmail(userEmail);
    if (!userToInvite) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    // Check if user is already a participant
    const isAlreadyParticipant = chat.participants.some(
      (p: any) => p.toString() === userToInvite._id.toString(),
    );

    if (isAlreadyParticipant) {
      throw new ForbiddenException('User is already a participant');
    }

    chat.participants.push(userToInvite._id as any);
    await chat.save();

    return this.findOne(chatId, requestUserId);
  }

  async getParticipantsCount(chatId: string): Promise<number> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }
    return chat.participants.length;
  }

  async updateLastMessage(chatId: string, messageId: string): Promise<void> {
    await this.chatModel.findByIdAndUpdate(
      chatId,
      {
        lastMessage: new Types.ObjectId(messageId),
        updatedAt: new Date()
      }
    ).exec();
  }

  async remove(id: string, userId: string): Promise<void> {
    const chat = await this.findOne(id, userId);

    // Only creator can delete the chat
    if (chat.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only the chat creator can delete this chat');
    }

    await this.chatModel.findByIdAndDelete(id).exec();
  }
}
