import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, FileMetadata } from '../interfaces/storage.interface';

// Note: This is a placeholder for future S3 implementation
// Install @aws-sdk/client-s3 when ready to implement

@Injectable()
export class S3StorageService implements IStorageService {
  constructor(private configService: ConfigService) {
    // TODO: Initialize S3 client when implementing
    // this.s3Client = new S3Client({
    //   region: this.configService.get<string>('AWS_REGION'),
    //   credentials: {
    //     accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
    //     secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    //   },
    // });
  }

  async upload(file: Buffer, metadata: FileMetadata): Promise<string> {
    const fileId = uuidv4();
    // TODO: Implement S3 upload
    throw new Error('S3 storage not yet implemented');
  }

  async download(fileId: string): Promise<Buffer> {
    // TODO: Implement S3 download
    throw new Error('S3 storage not yet implemented');
  }

  async delete(fileId: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3 storage not yet implemented');
  }

  async getUrl(fileId: string): Promise<string> {
    // TODO: Generate S3 signed URL
    throw new Error('S3 storage not yet implemented');
  }
}
