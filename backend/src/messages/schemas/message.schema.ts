import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true, enum: MessageType })
  type: MessageType;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyTo?: Types.ObjectId;

  @Prop({ type: [{ language: String, text: String }], default: [] })
  translations: Translation[];

  @Prop({ type: [{ content: String, editedAt: Date }], default: [] })
  editHistory: EditHistory[];

  @Prop({ type: Object })
  fileMetadata?: {
    originalName: string;
    mimeType: string;
    size: number;
    fileId: string;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
