import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  // Public: list published training items
  @Get('training')
  async listPublic() {
    return this.trainingService.findAllPublic();
  }

  // Admin: full CRUD
  @Get('admin/training')
  @UseGuards(AuthGuard)
  @Roles('super_admin', 'content_manager')
  async listAll() {
    return this.trainingService.findAll();
  }

  @Post('admin/training')
  @UseGuards(AuthGuard)
  @Roles('super_admin', 'content_manager')
  async create(@Body() body: any) {
    return this.trainingService.create(body);
  }

  @Put('admin/training/:id')
  @UseGuards(AuthGuard)
  @Roles('super_admin', 'content_manager')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.trainingService.update(id, body);
  }

  @Delete('admin/training/:id')
  @UseGuards(AuthGuard)
  @Roles('super_admin', 'content_manager')
  async remove(@Param('id') id: string) {
    return this.trainingService.remove(id);
  }
}
