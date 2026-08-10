import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface StoredFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

@Injectable()
export class StorageService {
  generateStorageKey(file: StoredFile): string {
    const extension = (file.originalname || 'bin').split('.').pop() || 'bin';
    const random = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${random}.${extension}`;
  }

  async upload(file: StoredFile, key: string, _contentType: string): Promise<{ key: string; size: number }> {
    ensureUploadsDir();
    const filePath = path.join(UPLOADS_DIR, key);
    fs.writeFileSync(filePath, file.buffer);
    return { key, size: file.size };
  }

  async getSignedUrl(key: string, _expiresIn = 3600): Promise<string> {
    // Return a plain public URL — served as static files by the API
    const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.API_PORT || 4000}`;
    return `${baseUrl}/uploads/${key}`;
  }

  async getObjectStream(key: string): Promise<{ stream: any; contentType: string }> {
    const filePath = path.join(UPLOADS_DIR, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    const ext = (key.split('.').pop() || 'bin').toLowerCase();
    const mimeMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
      pdf: 'application/pdf',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    return { stream, contentType };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(UPLOADS_DIR, key);
    return fs.existsSync(filePath);
  }
}

