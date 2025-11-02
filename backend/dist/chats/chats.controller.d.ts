import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { InviteUserDto } from './dto/invite-user.dto';
export declare class ChatsController {
    private readonly chatsService;
    constructor(chatsService: ChatsService);
    create(createChatDto: CreateChatDto, user: any): Promise<import("./schemas/chat.schema").Chat>;
    findAll(user: any): Promise<any[]>;
    findOne(id: string, user: any): Promise<any>;
    inviteUser(id: string, inviteUserDto: InviteUserDto, user: any): Promise<import("./schemas/chat.schema").Chat>;
    remove(id: string, user: any): Promise<void>;
}
