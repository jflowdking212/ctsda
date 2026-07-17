import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        const endpoint = configService.get('MINIO_ENDPOINT', 'http://localhost:9000');
        return new S3Client({
          endpoint,
          credentials: {
            accessKeyId: configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
            secretAccessKey: configService.get('MINIO_SECRET_KEY', 'minioadmin'),
          },
          region: 'us-east-1',
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}