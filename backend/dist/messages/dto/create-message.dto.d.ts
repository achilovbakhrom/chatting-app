import { MessageType } from '../../common/enums';
export declare class CreateMessageDto {
    chatId: string;
    type: MessageType;
    content: string;
    replyTo?: string;
}
