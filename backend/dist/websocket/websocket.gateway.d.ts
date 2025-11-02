import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private userSockets;
    private bidsService;
    constructor(jwtService: JwtService);
    setBidsService(bidsService: any): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinChat(client: Socket, chatId: string): void;
    handleLeaveChat(client: Socket, chatId: string): void;
    handleTypingStart(client: Socket, data: {
        chatId: string;
        userName: string;
    }): void;
    handleTypingStop(client: Socket, chatId: string): void;
    handleBidUpdateStatus(client: Socket, data: {
        bidId: string;
        status: string;
    }): Promise<{
        success: boolean;
        bid: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        bid?: undefined;
    }>;
    emitNewMessage(_chatId: string, message: any): void;
    emitMessageUpdate(chatId: string, message: any): void;
    emitMessageDelete(chatId: string, messageId: string): void;
    emitUserJoined(chatId: string, user: any): void;
    emitBidCreated(chatId: string, bid: any): void;
    emitBidUpdated(chatId: string, bid: any): void;
}
