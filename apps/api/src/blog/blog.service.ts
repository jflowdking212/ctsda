import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BlogService {
  private prisma = new PrismaClient();

  async listPublicPosts() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
    if (!post || !post.isPublished) throw new NotFoundException('Post not found');
    return post;
  }

  async listAllPosts() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  async createPost(authorId: string, data: any) {
    // Generate simple slug from title if not provided
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImg: data.featuredImg,
        isPublished: data.isPublished || false,
        publishedAt: data.isPublished ? new Date() : null,
        authorId,
      },
    });
  }

  async updatePost(id: string, data: any) {
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async deletePost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
