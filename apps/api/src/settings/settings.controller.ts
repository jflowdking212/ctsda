import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get()
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin')
  async getSettings() {
    return this.settingsService.getAll();
  }

  @Post()
  @Put()
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin')
  async updateSettings(@Body() body: Record<string, any>) {
    return this.settingsService.updateAll(body);
  }

  @Post('test-smtp')
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin')
  async testSmtp(@Body() body: Record<string, any>) {
    return this.settingsService.testSmtp(body);
  }
}
