"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bids_service_1 = require("./bids.service");
const bids_controller_1 = require("./bids.controller");
const bid_schema_1 = require("./schemas/bid.schema");
const chats_module_1 = require("../chats/chats.module");
const messages_module_1 = require("../messages/messages.module");
const websocket_module_1 = require("../websocket/websocket.module");
let BidsModule = class BidsModule {
};
exports.BidsModule = BidsModule;
exports.BidsModule = BidsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: bid_schema_1.Bid.name, schema: bid_schema_1.BidSchema }]),
            chats_module_1.ChatsModule,
            (0, common_1.forwardRef)(() => messages_module_1.MessagesModule),
            websocket_module_1.WebsocketModule,
        ],
        controllers: [bids_controller_1.BidsController],
        providers: [bids_service_1.BidsService],
        exports: [bids_service_1.BidsService],
    })
], BidsModule);
//# sourceMappingURL=bids.module.js.map