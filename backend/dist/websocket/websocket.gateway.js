"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let WebsocketGateway = class WebsocketGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.userSockets = new Map();
    }
    setBidsService(bidsService) {
        this.bidsService = bidsService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                throw new common_1.UnauthorizedException('No token provided');
            }
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            if (!this.userSockets.has(payload.sub)) {
                this.userSockets.set(payload.sub, new Set());
            }
            this.userSockets.get(payload.sub).add(client.id);
            console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
        }
        catch (error) {
            console.error('Connection error:', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId && this.userSockets.has(userId)) {
            this.userSockets.get(userId).delete(client.id);
            if (this.userSockets.get(userId).size === 0) {
                this.userSockets.delete(userId);
            }
        }
        console.log(`Client disconnected: ${client.id}`);
    }
    handleJoinChat(client, chatId) {
        client.join(`chat:${chatId}`);
        console.log(`User ${client.data.userId} joined chat ${chatId}`);
    }
    handleLeaveChat(client, chatId) {
        client.leave(`chat:${chatId}`);
        console.log(`User ${client.data.userId} left chat ${chatId}`);
    }
    handleTypingStart(client, data) {
        this.server.emit('typing:start', {
            chatId: data.chatId,
            userId: client.data.userId,
            userName: data.userName,
        });
    }
    handleTypingStop(client, chatId) {
        this.server.emit('typing:stop', {
            chatId,
            userId: client.data.userId,
        });
    }
    async handleBidUpdateStatus(client, data) {
        try {
            const userId = client.data.userId;
            if (!userId) {
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            if (!this.bidsService) {
                throw new Error('BidsService not initialized');
            }
            const updatedBid = await this.bidsService.updateStatus(data.bidId, { status: data.status }, userId);
            return { success: true, bid: updatedBid };
        }
        catch (error) {
            console.error('Error updating bid status:', error);
            return { success: false, error: error.message };
        }
    }
    emitNewMessage(_chatId, message) {
        this.server.emit('message:new', message);
    }
    emitMessageUpdate(chatId, message) {
        this.server.to(`chat:${chatId}`).emit('message:update', message);
    }
    emitMessageDelete(chatId, messageId) {
        this.server.to(`chat:${chatId}`).emit('message:delete', messageId);
    }
    emitUserJoined(chatId, user) {
        this.server.to(`chat:${chatId}`).emit('chat:userJoined', user);
    }
    emitBidCreated(chatId, bid) {
        this.server.to(`chat:${chatId}`).emit('bid:created', bid);
    }
    emitBidUpdated(chatId, bid) {
        this.server.to(`chat:${chatId}`).emit('bid:updated', bid);
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join:chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave:chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('bid:updateStatus'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleBidUpdateStatus", null);
exports.WebsocketGateway = WebsocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map