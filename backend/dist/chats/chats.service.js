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
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_schema_1 = require("./schemas/chat.schema");
const users_service_1 = require("../users/users.service");
let ChatsService = class ChatsService {
    constructor(chatModel, usersService) {
        this.chatModel = chatModel;
        this.usersService = usersService;
    }
    async create(createChatDto, userId) {
        const participantIds = [
            ...createChatDto.participants.map((id) => new mongoose_2.Types.ObjectId(id)),
            new mongoose_2.Types.ObjectId(userId),
        ];
        const uniqueParticipants = Array.from(new Set(participantIds.map((id) => id.toString()))).map((id) => new mongoose_2.Types.ObjectId(id));
        const chat = new this.chatModel({
            participants: uniqueParticipants,
            isMutable: createChatDto.isMutable ?? true,
            createdBy: new mongoose_2.Types.ObjectId(userId),
        });
        return chat.save();
    }
    async findAll(userId) {
        const chats = await this.chatModel
            .find({ participants: new mongoose_2.Types.ObjectId(userId) })
            .sort({ updatedAt: -1 })
            .lean()
            .exec();
        const populatedChats = await Promise.all(chats.map(async (chat) => {
            const participantUsers = await Promise.all(chat.participants.map(async (participantId) => {
                const user = await this.usersService.findOne(participantId.toString());
                return {
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }));
            const createdByUser = await this.usersService.findOne(chat.createdBy.toString());
            let lastMessage = null;
            if (chat.lastMessage) {
                const Message = this.chatModel.db.model('Message');
                const msg = await Message.findById(chat.lastMessage).lean().exec();
                if (msg) {
                    const sender = await this.usersService.findOne(msg.senderId.toString());
                    lastMessage = {
                        _id: msg._id,
                        content: msg.content,
                        type: msg.type,
                        senderId: {
                            _id: sender._id,
                            name: sender.name
                        },
                        createdAt: msg.createdAt
                    };
                }
            }
            return {
                _id: chat._id,
                participants: participantUsers,
                isMutable: chat.isMutable,
                createdBy: {
                    _id: createdByUser._id,
                    name: createdByUser.name,
                    email: createdByUser.email,
                    role: createdByUser.role
                },
                lastMessage,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            };
        }));
        return populatedChats;
    }
    async findOne(id, userId) {
        const chat = await this.chatModel
            .findById(id)
            .exec();
        if (!chat) {
            throw new common_1.NotFoundException(`Chat with ID ${id} not found`);
        }
        const isParticipant = chat.participants.some((p) => p.toString() === userId);
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not a participant of this chat');
        }
        const participantUsers = await Promise.all(chat.participants.map(async (participantId) => {
            return await this.usersService.findOne(participantId.toString());
        }));
        const createdByUser = await this.usersService.findOne(chat.createdBy.toString());
        return {
            _id: chat._id,
            participants: participantUsers.map((u) => ({ _id: u._id, id: u._id, name: u.name, email: u.email, role: u.role })),
            isMutable: chat.isMutable,
            createdBy: { _id: createdByUser._id, name: createdByUser.name, email: createdByUser.email, role: createdByUser.role },
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
        };
    }
    async inviteUser(chatId, userEmail, requestUserId) {
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat) {
            throw new common_1.NotFoundException(`Chat with ID ${chatId} not found`);
        }
        const isParticipant = chat.participants.some((p) => p.toString() === requestUserId);
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not a participant of this chat');
        }
        const userToInvite = await this.usersService.findByEmail(userEmail);
        if (!userToInvite) {
            throw new common_1.NotFoundException(`User with email ${userEmail} not found`);
        }
        const isAlreadyParticipant = chat.participants.some((p) => p.toString() === userToInvite._id.toString());
        if (isAlreadyParticipant) {
            throw new common_1.ForbiddenException('User is already a participant');
        }
        chat.participants.push(userToInvite._id);
        await chat.save();
        return this.findOne(chatId, requestUserId);
    }
    async getParticipantsCount(chatId) {
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat) {
            throw new common_1.NotFoundException(`Chat with ID ${chatId} not found`);
        }
        return chat.participants.length;
    }
    async updateLastMessage(chatId, messageId) {
        await this.chatModel.findByIdAndUpdate(chatId, {
            lastMessage: new mongoose_2.Types.ObjectId(messageId),
            updatedAt: new Date()
        }).exec();
    }
    async remove(id, userId) {
        const chat = await this.findOne(id, userId);
        if (chat.createdBy.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the chat creator can delete this chat');
        }
        await this.chatModel.findByIdAndDelete(id).exec();
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_schema_1.Chat.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map