import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, FileMetadata } from '../interfaces/storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    if (!this.bucketName) {
      this.logger.warn('AWS_S3_BUCKET_NAME is not configured');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(`S3StorageService initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Upload file to S3 in the chat folder
   * Files are stored with path: chat/{fileId}
   */
  async upload(file: Buffer, metadata: FileMetadata): Promise<string> {
    const fileId = uuidv4();
    const key = `chat/${fileId}`; // Store in chat folder

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: metadata.mimeType,
        Metadata: {
          originalName: metadata.originalName,
          userId: metadata.userId,
          size: metadata.size.toString(),
        },
      });

      await this.s3Client.send(command);

      this.logger.log(`File uploaded to S3: ${key} (${metadata.originalName})`);

      return fileId;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from S3
   */
  async download(fileId: string): Promise<Buffer> {
    const key = `chat/${fileId}`;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to download file from S3: ${error.message}`, error.stack);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async delete(fileId: string): Promise<void> {
    const key = `chat/${fileId}`;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate pre-signed URL for file access
   * URL expires in 1 hour by default
   */
  async getUrl(fileId: string): Promise<string> {
    const key = `chat/${fileId}`;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Generate pre-signed URL that expires in 1 hour
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack);
      throw new Error(`Failed to generate file URL: ${error.message}`);
    }
  }
}
