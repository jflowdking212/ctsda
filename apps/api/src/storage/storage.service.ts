import { Inject, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

export interface StoredFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

@Injectable()
export class StorageService {
  constructor(@Inject('S3_CLIENT') private s3: S3Client) {}

  generateStorageKey(file: StoredFile): string {
    const extension = file.originalname.split('.').pop() || '';
    const random = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${random}.${extension}`;
  }

  async upload(file: StoredFile, key: string, contentType: string): Promise<{ key: string; size: number }> {
    const buffer = file.buffer;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET || 'ctsda-documents',
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          'original-filename': Buffer.from(file.originalname).toString('base64'),
        },
      }),
    );

    return { key, size: file.size };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET || 'ctsda-documents',
      Key: key,
    });

    return getSignedUrl(this.s3 as any, command, { expiresIn });
  }

  async delete(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.MINIO_BUCKET || 'ctsda-documents',
        Key: key,
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: process.env.MINIO_BUCKET || 'ctsda-documents',
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
