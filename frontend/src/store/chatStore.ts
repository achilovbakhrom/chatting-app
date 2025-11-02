import { create } from "zustand";
import type { Chat, Message } from "../types";

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  unreadCounts: Record<string, number>;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
  updateChatLastMessage: (chatId: string, message: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChat: null,
  messages: [],
  unreadCounts: {},

  setChats: (chats) => set({ chats }),

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats],
    })),

  setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (message) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === message._id ? message : m
      ),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m._id !== messageId),
    })),

  incrementUnread: (chatId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: (state.unreadCounts[chatId] || 0) + 1,
      },
    })),

  clearUnread: (chatId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: 0,
      },
    })),

  updateChatLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage: message,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    })),
}));
