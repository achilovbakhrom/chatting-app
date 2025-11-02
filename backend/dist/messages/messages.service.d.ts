import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ChatsService } from '../chats/chats.service';
import { TranslationService } from '../translation/translation.service';
import { IStorageService } from '../storage/interfaces/storage.interface';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { BidDocument } from '../bids/schemas/bid.schema';
export declare class MessagesService {
    private messageModel;
    private bidModel;
    private chatsService;
    private translationService;
    private storageService;
    private websocketGateway;
    constructor(messageModel: Model<MessageDocument>, bidModel: Model<BidDocument>, chatsService: ChatsService, translationService: TranslationService, storageService: IStorageService, websocketGateway: WebsocketGateway);
    create(createMessageDto: CreateMessageDto, userId: string, file?: Express.Multer.File): Promise<MessageDocument>;
    findAllByChat(chatId: string, userId: string): Promise<any[]>;
    findOne(id: string, userId: string): Promise<MessageDocument>;
    update(id: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<Message>;
    remove(id: string, userId: string): Promise<void>;
    translateMessage(messageId: string, targetLanguage: string, userId: string): Promise<string>;
    downloadFile(messageId: string, userId: string): Promise<Buffer>;
}
