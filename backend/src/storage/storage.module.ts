import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3StorageService } from './services/s3-storage.service';
import { StorageController } from './storage.controller';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      useExisting: S3StorageService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
