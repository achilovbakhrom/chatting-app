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
exports.BidsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bid_schema_1 = require("./schemas/bid.schema");
const chats_service_1 = require("../chats/chats.service");
const messages_service_1 = require("../messages/messages.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const enums_1 = require("../common/enums");
let BidsService = class BidsService {
    constructor(bidModel, chatsService, messagesService, websocketGateway) {
        this.bidModel = bidModel;
        this.chatsService = chatsService;
        this.messagesService = messagesService;
        this.websocketGateway = websocketGateway;
        this.websocketGateway.setBidsService(this);
    }
    async create(createBidDto, userId) {
        await this.chatsService.findOne(createBidDto.chatId, userId);
        const participantsCount = await this.chatsService.getParticipantsCount(createBidDto.chatId);
        if (participantsCount > 2) {
            throw new common_1.BadRequestException('Bidding is only allowed in chats with 2 participants');
        }
        const message = await this.messagesService.create({
            chatId: createBidDto.chatId,
            type: enums_1.MessageType.BID,
            content: `Bid: ${createBidDto.amount} ${createBidDto.currency}`,
        }, userId);
        const bid = new this.bidModel({
            messageId: message._id,
            chatId: new mongoose_2.Types.ObjectId(createBidDto.chatId),
            amount: createBidDto.amount,
            currency: createBidDto.currency,
            description: createBidDto.description,
            status: enums_1.BidStatus.PENDING,
            createdBy: new mongoose_2.Types.ObjectId(userId),
            addressedTo: new mongoose_2.Types.ObjectId(createBidDto.addressedTo),
        });
        return bid.save();
    }
    async findAllByChat(chatId, userId) {
        await this.chatsService.findOne(chatId, userId);
        return this.bidModel
            .find({ chatId: new mongoose_2.Types.ObjectId(chatId) })
            .populate('createdBy', '-password')
            .populate('addressedTo', '-password')
            .populate('messageId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id, userId) {
        const bid = await this.bidModel
            .findById(id)
            .populate('createdBy', '-password')
            .populate('addressedTo', '-password')
            .populate('messageId')
            .exec();
        if (!bid) {
            throw new common_1.NotFoundException(`Bid with ID ${id} not found`);
        }
        await this.chatsService.findOne(bid.chatId.toString(), userId);
        return bid;
    }
    async updateStatus(id, updateBidStatusDto, userId) {
        const bidForAuth = await this.bidModel.findById(id).exec();
        if (!bidForAuth) {
            throw new common_1.NotFoundException(`Bid with ID ${id} not found`);
        }
        await this.chatsService.findOne(bidForAuth.chatId.toString(), userId);
        if (bidForAuth.addressedTo.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only update bids addressed to you');
        }
        if (bidForAuth.status !== enums_1.BidStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bids can be updated');
        }
        bidForAuth.status = updateBidStatusDto.status;
        bidForAuth.updatedAt = new Date();
        await bidForAuth.save();
        const updatedBid = await this.findOne(id, userId);
        this.websocketGateway.emitBidUpdated(bidForAuth.chatId.toString(), updatedBid);
        return updatedBid;
    }
    async remove(id, userId) {
        const bid = await this.bidModel.findById(id).exec();
        if (!bid) {
            throw new common_1.NotFoundException(`Bid with ID ${id} not found`);
        }
        await this.chatsService.findOne(bid.chatId.toString(), userId);
        if (bid.createdBy.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own bids');
        }
        if (bid.status !== enums_1.BidStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bids can be deleted');
        }
        await this.bidModel.findByIdAndDelete(id).exec();
    }
};
exports.BidsService = BidsService;
exports.BidsService = BidsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bid_schema_1.Bid.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => messages_service_1.MessagesService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        chats_service_1.ChatsService,
        messages_service_1.MessagesService,
        websocket_gateway_1.WebsocketGateway])
], BidsService);
//# sourceMappingURL=bids.service.js.map