import { Document, Types } from 'mongoose';
import { BidStatus } from '../../common/enums';
export type BidDocument = Bid & Document;
export declare class Bid {
    messageId: Types.ObjectId;
    chatId: Types.ObjectId;
    amount: number;
    currency: string;
    description?: string;
    status: BidStatus;
    createdBy: Types.ObjectId;
    addressedTo: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BidSchema: import("mongoose").Schema<Bid, import("mongoose").Model<Bid, any, any, any, Document<unknown, any, Bid, any, {}> & Bid & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Bid, Document<unknown, {}, import("mongoose").FlatRecord<Bid>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Bid> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
