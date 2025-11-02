import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidStatusDto } from './dto/update-bid-status.dto';
export declare class BidsController {
    private readonly bidsService;
    constructor(bidsService: BidsService);
    create(createBidDto: CreateBidDto, user: any): Promise<import("./schemas/bid.schema").Bid>;
    findAllByChat(chatId: string, user: any): Promise<import("./schemas/bid.schema").Bid[]>;
    findOne(id: string, user: any): Promise<import("./schemas/bid.schema").BidDocument>;
    updateStatus(id: string, updateBidStatusDto: UpdateBidStatusDto, user: any): Promise<import("./schemas/bid.schema").Bid>;
    remove(id: string, user: any): Promise<void>;
}
