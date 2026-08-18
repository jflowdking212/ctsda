import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

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
    let validAuthorId = authorId;
    if (!validAuthorId) {
      const admin = await this.prisma.user.findFirst({ where: { role: { in: ['super_admin', 'content_manager'] } } });
      validAuthorId = admin?.id || '';
    }

    let slug = data.slug || (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) slug = `post-${Date.now()}`;

    // Ensure unique slug
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const isPublished = data.isPublished === true || data.isPublished === 'true';

    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || (data.content ? data.content.replace(/<[^>]*>?/gm, '').slice(0, 160) : ''),
        content: data.content,
        featuredImg: data.featuredImg || null,
        isPublished,
        publishedAt: isPublished ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
        authorId: validAuthorId,
      },
    });
  }

  async updatePost(id: string, data: any) {
    const isPublished = data.isPublished === true || data.isPublished === 'true';
    const updateData: any = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featuredImg: data.featuredImg,
      isPublished,
    };
    if (data.slug) {
      updateData.slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (isPublished && !data.publishedAt) {
      updateData.publishedAt = new Date();
    } else if (isPublished === false) {
      updateData.publishedAt = null;
    }
    return this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}

