import { Body, Controller, HttpCode, Post, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateUserSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@ctsda/contracts';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { VerifyTotpDto } from './dto/totp.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

import { RequestOtpSchema, VerifyOtpSchema, RegisterApplicantSchema } from '@ctsda/contracts';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(200)
  async requestOtp(@Body() body: unknown) {
    const dto = RequestOtpSchema.parse(body);
    return this.authService.requestOtp(dto.email);
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@Body() body: unknown) {
    const dto = VerifyOtpSchema.parse(body);
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Post('register')
  async register(@Body() body: unknown) {
    const dto = RegisterApplicantSchema.parse(body);
    const result = await this.authService.registerApplicant({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    return {
      user: result.user,
      message: 'Account created in pending state. Proceed to payment.',
    };
  }

  @Post('setup-account')
  @HttpCode(200)
  async setupAccount(@Body() body: any) {
    if (!body.token || !body.password) {
      throw new UnauthorizedException('Token and password are required');
    }
    return this.authService.setupAccount(body.token, body.password);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: unknown) {
    const dto = ForgotPasswordSchema.parse(body);
    await this.authService.requestPasswordReset(dto.email);
    return { success: true, message: 'If the account exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: unknown) {
    const dto = ResetPasswordSchema.parse(body);
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Request() req: any, @Res({ passthrough: true }) reply: any): Promise<LoginResponseDto> {
    await this.authService.assertLoginNotLocked(dto.email, req.ip);

    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      await this.authService.incrementLoginFailures(dto.email, req.ip);
      await this.authService.recordFailedLogin(dto.email, req.ip, req.headers['user-agent']);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.forcePasswordReset) {
      return {
        requiresPasswordReset: true,
        message: 'Password reset is required before dashboard access.',
      };
    }

    // Check if TOTP is required for admin users
    if (this.authService.isAdminRole(user.role) && user.isTotpEnabled) {
      if (!dto.totpCode) {
        return {
          requiresTotp: true,
          tempToken: Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64'),
        };
      }

      const valid = await this.authService.verifyTotp(user.id, dto.totpCode);
      if (!valid) {
        throw new UnauthorizedException('Invalid TOTP code');
      }
    }

    const sessionId = await this.authService.createSession(
      user.id,
      user.role,
      req.ip,
      req.headers['user-agent'],
    );
    await this.authService.clearLoginFailures(dto.email, req.ip);
    await this.authService.recordLogin(user.id, req.ip, req.headers['user-agent']);

    reply.setCookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(process.env.SESSION_TTL_SECONDS || 86400),
    });

    return {
      accessToken: sessionId,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() user: any, @Request() req: any, @Res({ passthrough: true }) reply: any) {
    await this.authService.revokeSession(user.sessionId);
    await this.authService.recordLogout(user.userId, req.ip, req.headers['user-agent']);
    reply.clearCookie('sessionId', { path: '/' });
    return { success: true, message: 'Logged out' };
  }

  @Post('setup-totp')
  @UseGuards(AuthGuard)
  async setupTotp(@CurrentUser() user: any): Promise<{ secret: string; qrCodeUrl: string }> {
    return this.authService.setupTotp(user.userId);
  }

  @Post('verify-totp')
  @UseGuards(AuthGuard)
  async verifyTotp(@CurrentUser() user: any, @Body() dto: VerifyTotpDto) {
    const valid = await this.authService.verifyTotp(user.userId, dto.code);
    if (!valid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }
    await this.authService.enableTotp(user.userId);
    return { success: true, message: 'TOTP enabled' };
  }
}
