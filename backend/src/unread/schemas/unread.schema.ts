import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UnreadDocument = Unread & Document;

@Schema({ timestamps: true })
export class Unread {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true, index: true })
  chatId: Types.ObjectId;

  // Track the last message this user has read in this chat
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastReadMessageId?: Types.ObjectId;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UnreadSchema = SchemaFactory.createForClass(Unread);

// Compound index for efficient queries
UnreadSchema.index({ userId: 1, chatId: 1 }, { unique: true });
