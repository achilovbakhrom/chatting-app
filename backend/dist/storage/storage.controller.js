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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const local_storage_service_1 = require("./services/local-storage.service");
const fs = require("fs/promises");
const path = require("path");
let StorageController = class StorageController {
    constructor(localStorageService, configService) {
        this.localStorageService = localStorageService;
        this.configService = configService;
        this.storagePath = this.configService.get('STORAGE_PATH') || './uploads';
    }
    async getFile(fileId, res) {
        try {
            const fileBuffer = await this.localStorageService.download(fileId);
            const metadataPath = path.join(this.storagePath, `${fileId}.json`);
            let metadata = {};
            try {
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                metadata = JSON.parse(metadataContent);
            }
            catch (error) {
            }
            res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
            res.setHeader('Content-Length', fileBuffer.length);
            const inlineTypes = ['audio/', 'video/', 'image/'];
            if (metadata.mimeType && inlineTypes.some(type => metadata.mimeType.startsWith(type))) {
                res.setHeader('Content-Disposition', `inline; filename="${metadata.originalName || 'file'}"`);
            }
            else {
                res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName || 'file'}"`);
            }
            res.send(fileBuffer);
        }
        catch (error) {
            throw new common_1.NotFoundException('File not found');
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)(':fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getFile", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [local_storage_service_1.LocalStorageService,
        config_1.ConfigService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map