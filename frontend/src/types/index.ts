export type UserRole = 'LOAD_OWNER' | 'TRUCK_DRIVER';

export const UserRole = {
  LOAD_OWNER: 'LOAD_OWNER' as const,
  TRUCK_DRIVER: 'TRUCK_DRIVER' as const,
};

export type MessageType = 'TEXT' | 'VOICE' | 'FILE' | 'BID';

export const MessageType = {
  TEXT: 'TEXT' as const,
  VOICE: 'VOICE' as const,
  FILE: 'FILE' as const,
  BID: 'BID' as const,
};

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export const BidStatus = {
  PENDING: 'PENDING' as const,
  ACCEPTED: 'ACCEPTED' as const,
  REJECTED: 'REJECTED' as const,
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language: string;
  translationEnabled: boolean;
  avatar?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  participants: User[];
  isMutable: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Translation {
  language: string;
  text: string;
}

export interface EditHistory {
  content: string;
  editedAt: string;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  fileId: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: User;
  type: MessageType;
  content: string;
  replyTo?: Message;
  translations: Translation[];
  editHistory: EditHistory[];
  fileMetadata?: FileMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  messageId: string;
  chatId: string;
  amount: number;
  currency: string;
  description?: string;
  status: BidStatus;
  createdBy: User;
  addressedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
