import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ChatsService } from '../chats/chats.service';
import { TranslationService } from '../translation/translation.service';
import { IStorageService } from '../storage/interfaces/storage.interface';
import { STORAGE_SERVICE } from '../storage/storage.module';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { MessageType } from '../common/enums';
import { Bid, BidDocument } from '../bids/schemas/bid.schema';
import { UnreadService } from '../unread/unread.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    private chatsService: ChatsService,
    private translationService: TranslationService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
    private websocketGateway: WebsocketGateway,
    private unreadService: UnreadService,
  ) {}

  async create(createMessageDto: CreateMessageDto, userId: string, file?: Express.Multer.File): Promise<MessageDocument> {
    // Verify user is a participant of the chat
    const chat = await this.chatsService.findOne(createMessageDto.chatId, userId);

    const messageData: any = {
      chatId: new Types.ObjectId(createMessageDto.chatId),
      senderId: new Types.ObjectId(userId),
      type: createMessageDto.type,
      content: createMessageDto.content,
    };

    if (createMessageDto.replyTo) {
      messageData.replyTo = new Types.ObjectId(createMessageDto.replyTo);
    }

    // Handle file uploads (voice or file messages)
    if (file && (createMessageDto.type === MessageType.VOICE || createMessageDto.type === MessageType.FILE)) {
      const fileId = await this.storageService.upload(file.buffer, {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId,
      });

      messageData.fileMetadata = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        fileId,
      };

      // For file/voice messages, content is the file URL
      messageData.content = await this.storageService.getUrl(fileId);
    }

    // Auto-translate for participants if it's a text message
    if (createMessageDto.type === MessageType.TEXT && messageData.content) {
      const translations = [];

      // Cast participants to any since they are populated User documents
      const participants = chat.participants as any[];

      // Detect source language from sender
      const sender = participants.find(p => p._id.toString() === userId);
      const sourceLanguage = sender?.language || 'en';

      // Translate for each participant who has translation enabled and different language
      for (const participant of participants) {
        if (
          participant._id.toString() !== userId &&
          participant.translationEnabled &&
          participant.language !== sourceLanguage
        ) {
          try {
            const translatedText = await this.translationService.translate(
              messageData.content,
              sourceLanguage,
              participant.language,
            );
            translations.push({
              language: participant.language,
              text: translatedText,
            });
          } catch (error) {
            console.error(`Translation failed for ${participant.language}:`, error);
          }
        }
      }

      messageData.translations = translations;
    }

    // Mark message as unread for all participants except sender
    const participants = chat.participants as any[];
    messageData.unreadBy = participants
      .filter(p => p._id.toString() !== userId)
      .map(p => new Types.ObjectId(p._id.toString()));

    console.log(`[MessagesService] Creating message with unreadBy:`, messageData.unreadBy.map(id => id.toString()));

    const message = new this.messageModel(messageData);
    const savedMessage = await message.save();

    // Update chat's lastMessage
    await this.chatsService.updateLastMessage(createMessageDto.chatId, savedMessage._id.toString());

    // Populate sender information for WebSocket broadcast
    const populatedMessage = await this.messageModel
      .findById(savedMessage._id)
      .populate('senderId', '-password')
      .populate('replyTo')
      .lean()
      .exec();

    // Emit WebSocket event to all users in the chat
    // Ensure chatId is a string for proper serialization
    const messageToEmit = {
      ...populatedMessage,
      chatId: createMessageDto.chatId,
    };
    this.websocketGateway.emitNewMessage(createMessageDto.chatId, messageToEmit);

    return savedMessage;
  }

  async findAllByChat(
    chatId: string,
    userId: string,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    // Verify user is a participant
    await this.chatsService.findOne(chatId, userId);

    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 50;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.messageModel.countDocuments({
      chatId: new Types.ObjectId(chatId),
    });

    // Use aggregation to efficiently populate bids in one query
    const messages = await this.messageModel.aggregate([
      {
        $match: { chatId: new Types.ObjectId(chatId) }
      },
      {
        $sort: { createdAt: 1 }
      },
      // Pagination
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      // Lookup sender
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderDoc'
        }
      },
      // Lookup replyTo message
      {
        $lookup: {
          from: 'messages',
          localField: 'replyTo',
          foreignField: '_id',
          as: 'replyToDoc'
        }
      },
      // Lookup bid (if message is BID type)
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'messageId',
          as: 'bidDoc'
        }
      },
      // Unwind optional fields
      {
        $unwind: {
          path: '$senderDoc',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $unwind: {
          path: '$replyToDoc',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$bidDoc',
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup bid creator and addressedTo
      {
        $lookup: {
          from: 'users',
          localField: 'bidDoc.createdBy',
          foreignField: '_id',
          as: 'bidCreatorDoc'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'bidDoc.addressedTo',
          foreignField: '_id',
          as: 'bidAddressedToDoc'
        }
      },
      // Project final structure
      {
        $project: {
          _id: 1,
          chatId: 1,
          type: 1,
          content: 1,
          translations: 1,
          editHistory: 1,
          fileMetadata: 1,
          createdAt: 1,
          updatedAt: 1,
          senderId: {
            _id: '$senderDoc._id',
            name: '$senderDoc.name',
            email: '$senderDoc.email',
            role: '$senderDoc.role'
          },
          replyTo: {
            $cond: {
              if: { $ifNull: ['$replyToDoc', false] },
              then: '$replyToDoc',
              else: null
            }
          },
          bidData: {
            $cond: {
              if: { $ifNull: ['$bidDoc', false] },
              then: {
                _id: '$bidDoc._id',
                amount: '$bidDoc.amount',
                currency: '$bidDoc.currency',
                description: '$bidDoc.description',
                status: '$bidDoc.status',
                createdAt: '$bidDoc.createdAt',
                updatedAt: '$bidDoc.updatedAt',
                createdBy: {
                  $let: {
                    vars: { creator: { $arrayElemAt: ['$bidCreatorDoc', 0] } },
                    in: {
                      _id: '$$creator._id',
                      name: '$$creator.name',
                      email: '$$creator.email',
                      role: '$$creator.role'
                    }
                  }
                },
                addressedTo: {
                  $let: {
                    vars: { addressed: { $arrayElemAt: ['$bidAddressedToDoc', 0] } },
                    in: {
                      _id: '$$addressed._id',
                      name: '$$addressed.name',
                      email: '$$addressed.email',
                      role: '$$addressed.role'
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

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<MessageDocument> {
    const message = await this.messageModel
      .findById(id)
      .populate('senderId', '-password')
      .populate('replyTo')
      .exec();

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // Verify user is a participant of the chat
    await this.chatsService.findOne(message.chatId.toString(), userId);

    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<Message> {
    const message = await this.findOne(id, userId);

    // Only sender can edit their message
    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if chat is mutable
    const chat = await this.chatsService.findOne(message.chatId.toString(), userId);
    if (!chat.isMutable) {
      throw new ForbiddenException('Messages in this chat cannot be edited');
    }

    // Save edit history
    message.editHistory.push({
      content: message.content,
      editedAt: new Date(),
    });

    message.content = updateMessageDto.content;
    message.updatedAt = new Date();

    const updatedMessage = await message.save();

    // Emit WebSocket event
    this.websocketGateway.emitMessageUpdate(message.chatId.toString(), updatedMessage);

    return updatedMessage;
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.findOne(id, userId);

    // Only sender can delete their message
    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Delete associated file if exists
    if (message.fileMetadata?.fileId) {
      await this.storageService.delete(message.fileMetadata.fileId);
    }

    const chatId = message.chatId.toString();
    await this.messageModel.findByIdAndDelete(id).exec();

    // Emit WebSocket event
    this.websocketGateway.emitMessageDelete(chatId, id);
  }

  async translateMessage(messageId: string, targetLanguage: string, userId: string): Promise<string> {
    const message = await this.findOne(messageId, userId);

    // Check if translation already exists
    const existingTranslation = message.translations.find((t) => t.language === targetLanguage);
    if (existingTranslation) {
      return existingTranslation.text;
    }

    // Only translate text messages
    if (message.type !== MessageType.TEXT) {
      throw new BadRequestException('Only text messages can be translated');
    }

    // Detect source language
    const sourceLanguage = await this.translationService.detectLanguage(message.content);

    // Translate
    const translatedText = await this.translationService.translate(
      message.content,
      sourceLanguage,
      targetLanguage,
    );

    // Save translation
    message.translations.push({
      language: targetLanguage,
      text: translatedText,
    });
    await message.save();

    return translatedText;
  }

  async downloadFile(messageId: string, userId: string): Promise<Buffer> {
    const message = await this.findOne(messageId, userId);

    if (!message.fileMetadata?.fileId) {
      throw new NotFoundException('This message does not have an attached file');
    }

    return this.storageService.download(message.fileMetadata.fileId);
  }
}
