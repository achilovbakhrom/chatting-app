import { ConfigService } from '@nestjs/config';
import { IStorageService, FileMetadata } from '../interfaces/storage.interface';
export declare class LocalStorageService implements IStorageService {
    private configService;
    private storagePath;
    constructor(configService: ConfigService);
    private ensureStorageDirectory;
    upload(file: Buffer, metadata: FileMetadata): Promise<string>;
    download(fileId: string): Promise<Buffer>;
    delete(fileId: string): Promise<void>;
    getUrl(fileId: string): Promise<string>;
}
