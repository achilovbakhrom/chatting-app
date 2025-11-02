import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private bidsService: any; // Will be injected later to avoid circular dependency

  constructor(private jwtService: JwtService) {}

  // Setter for BidsService to avoid circular dependency
  setBidsService(bidsService: any) {
    this.bidsService = bidsService;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;

      // Track user's socket
      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub).add(client.id);

      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:chat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(`chat:${chatId}`);
    console.log(`User ${client.data.userId} joined chat ${chatId}`);
  }

  @SubscribeMessage('leave:chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave(`chat:${chatId}`);
    console.log(`User ${client.data.userId} left chat ${chatId}`);
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userName: string },
  ) {
    // Emit to all connected sockets
    this.server.emit('typing:start', {
      chatId: data.chatId,
      userId: client.data.userId,
      userName: data.userName,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    // Emit to all connected sockets
    this.server.emit('typing:stop', {
      chatId,
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('bid:updateStatus')
  async handleBidUpdateStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bidId: string; status: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      if (!this.bidsService) {
        throw new Error('BidsService not initialized');
      }

      // Call BidsService to update the bid
      const updatedBid = await this.bidsService.updateStatus(
        data.bidId,
        { status: data.status },
        userId,
      );

      return { success: true, bid: updatedBid };
    } catch (error) {
      console.error('Error updating bid status:', error);
      return { success: false, error: error.message };
    }
  }

  // Server-side methods to emit events
  emitNewMessage(_chatId: string, message: any) {
    // Emit to all connected sockets (covers both /chats page and chat rooms)
    this.server.emit('message:new', message);
  }

  emitMessageUpdate(chatId: string, message: any) {
    this.server.to(`chat:${chatId}`).emit('message:update', message);
  }

  emitMessageDelete(chatId: string, messageId: string) {
    this.server.to(`chat:${chatId}`).emit('message:delete', messageId);
  }

  emitUserJoined(chatId: string, user: any) {
    this.server.to(`chat:${chatId}`).emit('chat:userJoined', user);
  }

  emitBidCreated(chatId: string, bid: any) {
    this.server.to(`chat:${chatId}`).emit('bid:created', bid);
  }

  emitBidUpdated(chatId: string, bid: any) {
    this.server.to(`chat:${chatId}`).emit('bid:updated', bid);
  }
}
