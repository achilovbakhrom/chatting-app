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
    const chats = await this.chatModel
      .find({ participants: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    // Manually populate participants, createdBy, and lastMessage
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        // Populate participants
        const participantUsers = await Promise.all(
          chat.participants.map(async (participantId: any) => {
            const user = await this.usersService.findOne(participantId.toString());
            return {
              _id: (user as any)._id,
              id: (user as any)._id,
              name: user.name,
              email: user.email,
              role: user.role
            };
          })
        );

        // Populate createdBy
        const createdByUser = await this.usersService.findOne(chat.createdBy.toString());

        // Populate lastMessage if exists
        let lastMessage = null;
        if (chat.lastMessage) {
          const Message = this.chatModel.db.model('Message');
          const msg: any = await Message.findById(chat.lastMessage).lean().exec();
          if (msg) {
            const sender = await this.usersService.findOne(msg.senderId.toString());
            lastMessage = {
              _id: msg._id,
              content: msg.content,
              type: msg.type,
              senderId: {
                _id: (sender as any)._id,
                name: sender.name
              },
              createdAt: msg.createdAt
            };
          }
        }

        return {
          _id: chat._id,
          participants: participantUsers,
          isMutable: chat.isMutable,
          createdBy: {
            _id: (createdByUser as any)._id,
            name: createdByUser.name,
            email: createdByUser.email,
            role: createdByUser.role
          },
          lastMessage,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        };
      })
    );

    return populatedChats;
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
