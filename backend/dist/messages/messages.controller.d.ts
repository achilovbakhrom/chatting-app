import { Response } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { TranslateMessageDto } from './dto/translate-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(createMessageDto: CreateMessageDto, user: any, file?: Express.Multer.File): Promise<import("./schemas/message.schema").MessageDocument>;
    findAllByChat(chatId: string, user: any): Promise<any[]>;
    findOne(id: string, user: any): Promise<import("./schemas/message.schema").MessageDocument>;
    update(id: string, updateMessageDto: UpdateMessageDto, user: any): Promise<import("./schemas/message.schema").Message>;
    remove(id: string, user: any): Promise<void>;
    translate(id: string, translateDto: TranslateMessageDto, user: any): Promise<{
        translatedText: string;
    }>;
    downloadFile(id: string, user: any, res: Response): Promise<void>;
}
