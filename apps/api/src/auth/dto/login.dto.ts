import { z } from 'zod';
import { LoginSchema } from '@ctsda/contracts';

export const LoginDto = LoginSchema;
export type LoginDto = z.infer<typeof LoginDto>;

export interface LoginResponseDto {
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  requiresTotp?: boolean;
  requiresPasswordReset?: boolean;
  message?: string;
  tempToken?: string;
}
