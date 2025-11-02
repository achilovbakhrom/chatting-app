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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs/promises");
const path = require("path");
const uuid_1 = require("uuid");
let LocalStorageService = class LocalStorageService {
    constructor(configService) {
        this.configService = configService;
        this.storagePath = this.configService.get('STORAGE_PATH') || './uploads';
        this.ensureStorageDirectory();
    }
    async ensureStorageDirectory() {
        try {
            await fs.access(this.storagePath);
        }
        catch {
            await fs.mkdir(this.storagePath, { recursive: true });
        }
    }
    async upload(file, metadata) {
        const fileId = (0, uuid_1.v4)();
        const extension = path.extname(metadata.originalName);
        const filename = `${fileId}${extension}`;
        const filepath = path.join(this.storagePath, filename);
        await fs.writeFile(filepath, file);
        const metadataPath = path.join(this.storagePath, `${fileId}.json`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata));
        return fileId;
    }
    async download(fileId) {
        const files = await fs.readdir(this.storagePath);
        const file = files.find((f) => f.startsWith(fileId) && !f.endsWith('.json'));
        if (!file) {
            throw new Error(`File with ID ${fileId} not found`);
        }
        const filepath = path.join(this.storagePath, file);
        return fs.readFile(filepath);
    }
    async delete(fileId) {
        const files = await fs.readdir(this.storagePath);
        const filesToDelete = files.filter((f) => f.startsWith(fileId));
        for (const file of filesToDelete) {
            await fs.unlink(path.join(this.storagePath, file));
        }
    }
    async getUrl(fileId) {
        const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
        return `${backendUrl}/files/${fileId}`;
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map