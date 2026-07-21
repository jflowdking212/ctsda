import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getAll();
  }

  @Put()
  @UseGuards(AuthGuard)
  @Roles('super_admin')
  async updateSettings(@Body() body: Record<string, any>) {
    return this.settingsService.updateAll(body);
  }
}
