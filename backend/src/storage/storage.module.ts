import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageService } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';
import { StorageController } from './storage.controller';
import { IStorageService } from './interfaces/storage.interface';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      useFactory: (
        configService: ConfigService,
        localStorageService: LocalStorageService,
        s3StorageService: S3StorageService,
      ): IStorageService => {
        const storageType = configService.get<string>('STORAGE_TYPE') || 'local';

        if (storageType === 's3') {
          return s3StorageService;
        }

        return localStorageService;
      },
      inject: [ConfigService, LocalStorageService, S3StorageService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
