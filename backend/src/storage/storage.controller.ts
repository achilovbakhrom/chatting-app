import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './services/local-storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('files')
export class StorageController {
  private storagePath: string;

  constructor(
    private localStorageService: LocalStorageService,
    private configService: ConfigService,
  ) {
    this.storagePath = this.configService.get<string>('STORAGE_PATH') || './uploads';
  }

  @Get(':fileId')
  async getFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      // Get file buffer
      const fileBuffer = await this.localStorageService.download(fileId);

      // Get metadata to determine content type
      const metadataPath = path.join(this.storagePath, `${fileId}.json`);
      let metadata: any = {};

      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      } catch (error) {
        // If metadata doesn't exist, continue without it
      }

      // Set appropriate headers
      res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
      res.setHeader('Content-Length', fileBuffer.length);

      // For audio/video/images, allow inline viewing
      const inlineTypes = ['audio/', 'video/', 'image/'];
      if (metadata.mimeType && inlineTypes.some(type => metadata.mimeType.startsWith(type))) {
        res.setHeader('Content-Disposition', `inline; filename="${metadata.originalName || 'file'}"`);
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName || 'file'}"`);
      }

      res.send(fileBuffer);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
