import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { TrainingService } from './training.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
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
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin', 'content_manager')
  async listAll() {
    return this.trainingService.findAll();
  }

  @Post('admin/training')
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin', 'content_manager')
  async create(@Body() body: any) {
    return this.trainingService.create(body);
  }

  @Post('admin/training/:id/update')
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin', 'content_manager')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.trainingService.update(id, body);
  }

  @Post('admin/training/:id/delete')
  @UseGuards(AuthGuard, RbacGuard)
  @Roles('super_admin', 'content_manager')
  async remove(@Param('id') id: string) {
    return this.trainingService.remove(id);
  }

  // Public/User: Register for training (supports guest checkout)
  @Post('training/:id/register')
  async register(
    @Param('id') id: string, 
    @Body('userId') userId?: string,
    @Body('email') email?: string,
    @Body('name') name?: string,
  ) {
    return this.trainingService.register(userId || null, id, email || null, name || null);
  }

  // User: Get enrolled trainings
  @Get('portal/training/my-enrollments')
  @UseGuards(AuthGuard)
  async getMyEnrollments(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }
    return this.trainingService.getMyEnrollments(userId);
  }
}
