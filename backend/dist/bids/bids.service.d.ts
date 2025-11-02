import { Model } from 'mongoose';
import { Bid, BidDocument } from './schemas/bid.schema';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from '../messages/messages.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
export declare class BidsService {
    private bidModel;
    private chatsService;
    private messagesService;
    private websocketGateway;
    constructor(bidModel: Model<BidDocument>, chatsService: ChatsService, messagesService: MessagesService, websocketGateway: WebsocketGateway);
    create(createBidDto: CreateBidDto, userId: string): Promise<Bid>;
    findAllByChat(chatId: string, userId: string): Promise<Bid[]>;
    findOne(id: string, userId: string): Promise<BidDocument>;
    updateStatus(id: string, updateBidStatusDto: UpdateBidStatusDto, userId: string): Promise<Bid>;
    remove(id: string, userId: string): Promise<void>;
}
