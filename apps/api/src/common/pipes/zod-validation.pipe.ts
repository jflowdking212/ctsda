import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: { metatype?: any }) {
    if (!metadata.metatype || !this.isZodSchema(metadata.metatype)) {
      return value;
    }

    const schema = metadata.metatype as ZodSchema;
    const result = schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      });
    }

    return result.data;
  }

  private isZodSchema(metatype: any): boolean {
    return metatype?.constructor?.name === 'ZodObject' ||
           metatype?.constructor?.name === 'ZodEffects' ||
           metatype?.constructor?.name?.startsWith('Zod');
  }
}
