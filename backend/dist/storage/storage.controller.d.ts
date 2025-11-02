import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './services/local-storage.service';
export declare class StorageController {
    private localStorageService;
    private configService;
    private storagePath;
    constructor(localStorageService: LocalStorageService, configService: ConfigService);
    getFile(fileId: string, res: Response): Promise<void>;
}
