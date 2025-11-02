import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bid, BidDocument } from './schemas/bid.schema';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from '../messages/messages.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { BidStatus, MessageType } from '../common/enums';

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    private chatsService: ChatsService,
    @Inject(forwardRef(() => MessagesService))
    private messagesService: MessagesService,
    private websocketGateway: WebsocketGateway,
  ) {
    // Register this service with the gateway to avoid circular dependency
    this.websocketGateway.setBidsService(this);
  }

  async create(createBidDto: CreateBidDto, userId: string): Promise<Bid> {
    // Verify user is a participant
    await this.chatsService.findOne(createBidDto.chatId, userId);

    // Check if chat has only 2 participants (bidding only allowed in 1-on-1 chats)
    const participantsCount = await this.chatsService.getParticipantsCount(createBidDto.chatId);
    if (participantsCount > 2) {
      throw new BadRequestException('Bidding is only allowed in chats with 2 participants');
    }

    // Create a message for the bid
    const message = await this.messagesService.create(
      {
        chatId: createBidDto.chatId,
        type: MessageType.BID,
        content: `Bid: ${createBidDto.amount} ${createBidDto.currency}`,
      },
      userId,
    );

    // Create the bid
    const bid = new this.bidModel({
      messageId: message._id,
      chatId: new Types.ObjectId(createBidDto.chatId),
      amount: createBidDto.amount,
      currency: createBidDto.currency,
      description: createBidDto.description,
      status: BidStatus.PENDING,
      createdBy: new Types.ObjectId(userId),
      addressedTo: new Types.ObjectId(createBidDto.addressedTo),
    });

    return bid.save();
  }

  async findAllByChat(chatId: string, userId: string): Promise<Bid[]> {
    // Verify user is a participant
    await this.chatsService.findOne(chatId, userId);

    return this.bidModel
      .find({ chatId: new Types.ObjectId(chatId) })
      .populate('createdBy', '-password')
      .populate('addressedTo', '-password')
      .populate('messageId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<BidDocument> {
    const bid = await this.bidModel
      .findById(id)
      .populate('createdBy', '-password')
      .populate('addressedTo', '-password')
      .populate('messageId')
      .exec();

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    // Verify user is a participant of the chat
    await this.chatsService.findOne(bid.chatId.toString(), userId);

    return bid;
  }

  async updateStatus(id: string, updateBidStatusDto: UpdateBidStatusDto, userId: string): Promise<Bid> {
    // Fetch bid without population for authorization check
    const bidForAuth = await this.bidModel.findById(id).exec();

    if (!bidForAuth) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    // Verify user is a participant of the chat
    await this.chatsService.findOne(bidForAuth.chatId.toString(), userId);

    // Only the addressedTo user can accept/reject
    if (bidForAuth.addressedTo.toString() !== userId) {
      throw new ForbiddenException('You can only update bids addressed to you');
    }

    // Can only update pending bids
    if (bidForAuth.status !== BidStatus.PENDING) {
      throw new BadRequestException('Only pending bids can be updated');
    }

    bidForAuth.status = updateBidStatusDto.status;
    bidForAuth.updatedAt = new Date();

    await bidForAuth.save();

    // Get populated version
    const updatedBid = await this.findOne(id, userId);

    // Emit socket event to notify all participants in the chat
    this.websocketGateway.emitBidUpdated(bidForAuth.chatId.toString(), updatedBid);

    return updatedBid;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Fetch bid without population for authorization check
    const bid = await this.bidModel.findById(id).exec();

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    // Verify user is a participant of the chat
    await this.chatsService.findOne(bid.chatId.toString(), userId);

    // Only creator can delete their bid
    if (bid.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own bids');
    }

    // Can only delete pending bids
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Only pending bids can be deleted');
    }

    await this.bidModel.findByIdAndDelete(id).exec();
  }
}
