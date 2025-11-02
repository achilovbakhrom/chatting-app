import { Model } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { UsersService } from '../users/users.service';
export declare class ChatsService {
    private chatModel;
    private usersService;
    constructor(chatModel: Model<ChatDocument>, usersService: UsersService);
    create(createChatDto: CreateChatDto, userId: string): Promise<Chat>;
    findAll(userId: string): Promise<any[]>;
    findOne(id: string, userId: string): Promise<any>;
    inviteUser(chatId: string, userEmail: string, requestUserId: string): Promise<Chat>;
    getParticipantsCount(chatId: string): Promise<number>;
    updateLastMessage(chatId: string, messageId: string): Promise<void>;
    remove(id: string, userId: string): Promise<void>;
}
