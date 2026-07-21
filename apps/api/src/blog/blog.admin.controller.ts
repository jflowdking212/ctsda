import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/blog')
@UseGuards(AuthGuard, RbacGuard)
@Roles('super_admin', 'content_manager')
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async listAllPosts() {
    return this.blogService.listAllPosts();
  }

  @Post()
  async createPost(@CurrentUser() user: any, @Body() body: any) {
    return this.blogService.createPost(user.userId, body);
  }

  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() body: any) {
    return this.blogService.updatePost(id, body);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }
}
