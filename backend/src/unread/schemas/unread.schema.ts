import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UnreadDocument = Unread & Document;

@Schema({ timestamps: true })
export class Unread {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true, index: true })
  chatId: Types.ObjectId;

  @Prop({ default: 0 })
  count: number;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastReadMessageId?: Types.ObjectId;
}

export const UnreadSchema = SchemaFactory.createForClass(Unread);

// Compound index for efficient queries
UnreadSchema.index({ userId: 1, chatId: 1 }, { unique: true });
