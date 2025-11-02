import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinChat(chatId: string) {
    this.socket?.emit('join:chat', chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave:chat', chatId);
  }

  sendTypingStart(chatId: string, userName: string) {
    this.socket?.emit('typing:start', { chatId, userName });
  }

  sendTypingStop(chatId: string) {
    this.socket?.emit('typing:stop', chatId);
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('message:new', callback);
  }

  onMessageUpdate(callback: (message: any) => void) {
    this.socket?.on('message:update', callback);
  }

  onMessageDelete(callback: (messageId: string) => void) {
    this.socket?.on('message:delete', callback);
  }

  onUserJoined(callback: (user: any) => void) {
    this.socket?.on('chat:userJoined', callback);
  }

  onBidCreated(callback: (bid: any) => void) {
    this.socket?.on('bid:created', callback);
  }

  onBidUpdated(callback: (bid: any) => void) {
    this.socket?.on('bid:updated', callback);
  }

  onTypingStart(callback: (data: any) => void) {
    this.socket?.on('typing:start', callback);
  }

  onTypingStop(callback: (data: any) => void) {
    this.socket?.on('typing:stop', callback);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
