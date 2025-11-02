import { Document, Types } from 'mongoose';
import { MessageType } from '../../common/enums';
export type MessageDocument = Message & Document;
export interface Translation {
    language: string;
    text: string;
}
export interface EditHistory {
    content: string;
    editedAt: Date;
}
export declare class Message {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    type: MessageType;
    content: string;
    replyTo?: Types.ObjectId;
    translations: Translation[];
    editHistory: EditHistory[];
    fileMetadata?: {
        originalName: string;
        mimeType: string;
        size: number;
        fileId: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
