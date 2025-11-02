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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const chats_service_1 = require("../chats/chats.service");
const translation_service_1 = require("../translation/translation.service");
const storage_module_1 = require("../storage/storage.module");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const enums_1 = require("../common/enums");
const bid_schema_1 = require("../bids/schemas/bid.schema");
let MessagesService = class MessagesService {
    constructor(messageModel, bidModel, chatsService, translationService, storageService, websocketGateway) {
        this.messageModel = messageModel;
        this.bidModel = bidModel;
        this.chatsService = chatsService;
        this.translationService = translationService;
        this.storageService = storageService;
        this.websocketGateway = websocketGateway;
    }
    async create(createMessageDto, userId, file) {
        const chat = await this.chatsService.findOne(createMessageDto.chatId, userId);
        const messageData = {
            chatId: new mongoose_2.Types.ObjectId(createMessageDto.chatId),
            senderId: new mongoose_2.Types.ObjectId(userId),
            type: createMessageDto.type,
            content: createMessageDto.content,
        };
        if (createMessageDto.replyTo) {
            messageData.replyTo = new mongoose_2.Types.ObjectId(createMessageDto.replyTo);
        }
        if (file && (createMessageDto.type === enums_1.MessageType.VOICE || createMessageDto.type === enums_1.MessageType.FILE)) {
            const fileId = await this.storageService.upload(file.buffer, {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                userId,
            });
            messageData.fileMetadata = {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                fileId,
            };
            messageData.content = await this.storageService.getUrl(fileId);
        }
        if (createMessageDto.type === enums_1.MessageType.TEXT && messageData.content) {
            const translations = [];
            const participants = chat.participants;
            const sender = participants.find(p => p._id.toString() === userId);
            const sourceLanguage = sender?.language || 'en';
            for (const participant of participants) {
                if (participant._id.toString() !== userId &&
                    participant.translationEnabled &&
                    participant.language !== sourceLanguage) {
                    try {
                        const translatedText = await this.translationService.translate(messageData.content, sourceLanguage, participant.language);
                        translations.push({
                            language: participant.language,
                            text: translatedText,
                        });
                    }
                    catch (error) {
                        console.error(`Translation failed for ${participant.language}:`, error);
                    }
                }
            }
            messageData.translations = translations;
        }
        const message = new this.messageModel(messageData);
        const savedMessage = await message.save();
        await this.chatsService.updateLastMessage(createMessageDto.chatId, savedMessage._id.toString());
        const populatedMessage = await this.messageModel
            .findById(savedMessage._id)
            .populate('senderId', '-password')
            .populate('replyTo')
            .lean()
            .exec();
        const messageToEmit = {
            ...populatedMessage,
            chatId: createMessageDto.chatId,
        };
        this.websocketGateway.emitNewMessage(createMessageDto.chatId, messageToEmit);
        return savedMessage;
    }
    async findAllByChat(chatId, userId) {
        await this.chatsService.findOne(chatId, userId);
        const messages = await this.messageModel
            .find({ chatId: new mongoose_2.Types.ObjectId(chatId) })
            .populate('senderId', '-password')
            .populate('replyTo')
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        const messagesWithBids = await Promise.all(messages.map(async (message) => {
            if (message.type === 'BID') {
                const bid = await this.bidModel
                    .findOne({ messageId: message._id })
                    .populate('createdBy', '-password')
                    .populate('addressedTo', '-password')
                    .lean()
                    .exec();
                if (bid) {
                    return {
                        ...message,
                        bidData: bid,
                    };
                }
            }
            return message;
        }));
        return messagesWithBids;
    }
    async findOne(id, userId) {
        const message = await this.messageModel
            .findById(id)
            .populate('senderId', '-password')
            .populate('replyTo')
            .exec();
        if (!message) {
            throw new common_1.NotFoundException(`Message with ID ${id} not found`);
        }
        await this.chatsService.findOne(message.chatId.toString(), userId);
        return message;
    }
    async update(id, updateMessageDto, userId) {
        const message = await this.findOne(id, userId);
        if (message.senderId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own messages');
        }
        const chat = await this.chatsService.findOne(message.chatId.toString(), userId);
        if (!chat.isMutable) {
            throw new common_1.ForbiddenException('Messages in this chat cannot be edited');
        }
        message.editHistory.push({
            content: message.content,
            editedAt: new Date(),
        });
        message.content = updateMessageDto.content;
        message.updatedAt = new Date();
        const updatedMessage = await message.save();
        this.websocketGateway.emitMessageUpdate(message.chatId.toString(), updatedMessage);
        return updatedMessage;
    }
    async remove(id, userId) {
        const message = await this.findOne(id, userId);
        if (message.senderId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own messages');
        }
        if (message.fileMetadata?.fileId) {
            await this.storageService.delete(message.fileMetadata.fileId);
        }
        const chatId = message.chatId.toString();
        await this.messageModel.findByIdAndDelete(id).exec();
        this.websocketGateway.emitMessageDelete(chatId, id);
    }
    async translateMessage(messageId, targetLanguage, userId) {
        const message = await this.findOne(messageId, userId);
        const existingTranslation = message.translations.find((t) => t.language === targetLanguage);
        if (existingTranslation) {
            return existingTranslation.text;
        }
        if (message.type !== enums_1.MessageType.TEXT) {
            throw new common_1.BadRequestException('Only text messages can be translated');
        }
        const sourceLanguage = await this.translationService.detectLanguage(message.content);
        const translatedText = await this.translationService.translate(message.content, sourceLanguage, targetLanguage);
        message.translations.push({
            language: targetLanguage,
            text: translatedText,
        });
        await message.save();
        return translatedText;
    }
    async downloadFile(messageId, userId) {
        const message = await this.findOne(messageId, userId);
        if (!message.fileMetadata?.fileId) {
            throw new common_1.NotFoundException('This message does not have an attached file');
        }
        return this.storageService.download(message.fileMetadata.fileId);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(bid_schema_1.Bid.name)),
    __param(4, (0, common_1.Inject)(storage_module_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        chats_service_1.ChatsService,
        translation_service_1.TranslationService, Object, websocket_gateway_1.WebsocketGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map