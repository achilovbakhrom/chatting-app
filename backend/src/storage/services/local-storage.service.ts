import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, FileMetadata } from '../interfaces/storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private storagePath: string;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>('STORAGE_PATH') || './uploads';
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory() {
    try {
      await fs.access(this.storagePath);
    } catch {
      await fs.mkdir(this.storagePath, { recursive: true });
    }
  }

  async upload(file: Buffer, metadata: FileMetadata): Promise<string> {
    const fileId = uuidv4();
    const extension = path.extname(metadata.originalName);
    const filename = `${fileId}${extension}`;
    const filepath = path.join(this.storagePath, filename);

    await fs.writeFile(filepath, file);

    // Store metadata
    const metadataPath = path.join(this.storagePath, `${fileId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata));

    return fileId;
  }

  async download(fileId: string): Promise<Buffer> {
    const files = await fs.readdir(this.storagePath);
    const file = files.find((f) => f.startsWith(fileId) && !f.endsWith('.json'));

    if (!file) {
      throw new Error(`File with ID ${fileId} not found`);
    }

    const filepath = path.join(this.storagePath, file);
    return fs.readFile(filepath);
  }

  async delete(fileId: string): Promise<void> {
    const files = await fs.readdir(this.storagePath);
    const filesToDelete = files.filter((f) => f.startsWith(fileId));

    for (const file of filesToDelete) {
      await fs.unlink(path.join(this.storagePath, file));
    }
  }

  async getUrl(fileId: string): Promise<string> {
    // For local storage, return a URL path that can be served by the API
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
    return `${backendUrl}/files/${fileId}`;
  }
}
