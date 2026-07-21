import { BadRequestException } from '@nestjs/common';
import { DocumentsService } from '../src/documents/documents.service';

describe('DocumentsService upload security', () => {
  const service = new DocumentsService({} as any, {} as any);

  it('rejects invalid file magic bytes', () => {
    expect(() =>
      service.detectFileType({
        originalname: 'certificate.pdf',
        buffer: Buffer.from('not really a pdf'),
        size: 16,
      } as any),
    ).toThrow(BadRequestException);
  });

  it('rejects docx-looking uploads that are not named docx', () => {
    expect(() =>
      service.detectFileType({
        originalname: 'payload.exe',
        buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]),
        size: 5,
      } as any),
    ).toThrow(BadRequestException);
  });

  it('accepts PDF files by signature', () => {
    expect(
      service.detectFileType({
        originalname: 'certificate.pdf',
        buffer: Buffer.from('%PDF-1.7'),
        size: 8,
      } as any),
    ).toEqual({ ext: 'pdf', mime: 'application/pdf' });
  });
});
