import { ConfigService } from '@nestjs/config';
import { IStorageService, FileMetadata } from '../interfaces/storage.interface';
export declare class S3StorageService implements IStorageService {
    private configService;
    constructor(configService: ConfigService);
    upload(file: Buffer, metadata: FileMetadata): Promise<string>;
    download(fileId: string): Promise<Buffer>;
    delete(fileId: string): Promise<void>;
    getUrl(fileId: string): Promise<string>;
}
