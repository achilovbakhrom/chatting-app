import { Document, Types } from 'mongoose';
export type ChatDocument = Chat & Document;
export declare class Chat {
    participants: Types.ObjectId[];
    isMutable: boolean;
    createdBy: Types.ObjectId;
    lastMessage?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatSchema: import("mongoose").Schema<Chat, import("mongoose").Model<Chat, any, any, any, Document<unknown, any, Chat, any, {}> & Chat & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Chat, Document<unknown, {}, import("mongoose").FlatRecord<Chat>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Chat> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
