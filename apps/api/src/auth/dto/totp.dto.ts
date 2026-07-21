import { z } from 'zod';
import { SetupTotpSchema, VerifyTotpSchema } from '@ctsda/contracts';

export const SetupTotpDto = SetupTotpSchema;
export type SetupTotpDto = z.infer<typeof SetupTotpDto>;

export const VerifyTotpDto = VerifyTotpSchema;
export type VerifyTotpDto = z.infer<typeof VerifyTotpDto>;
