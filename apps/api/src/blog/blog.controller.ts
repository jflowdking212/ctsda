import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async listPosts() {
    return this.blogService.listPublicPosts();
  }

  @Get(':slug')
  async getPost(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }
}
