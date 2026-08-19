import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async listPublicPosts() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!post || !post.isPublished) throw new NotFoundException('Post not found');
    return post;
  }

  async listAllPosts() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
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

    let categoryId = data.categoryId || null;
    if (!categoryId && data.category) {
      const catSlug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const cat = await this.prisma.blogCategory.upsert({
        where: { name: data.category },
        update: {},
        create: { name: data.category, slug: catSlug || `cat-${Date.now()}` },
      });
      categoryId = cat.id;
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
        categoryId,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { id: true, name: true, slug: true } },
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
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId || null;
    } else if (data.category !== undefined) {
      if (data.category) {
        const catSlug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const cat = await this.prisma.blogCategory.upsert({
          where: { name: data.category },
          update: {},
          create: { name: data.category, slug: catSlug || `cat-${Date.now()}` },
        });
        updateData.categoryId = cat.id;
      } else {
        updateData.categoryId = null;
      }
    }
    if (isPublished && !data.publishedAt) {
      updateData.publishedAt = new Date();
    } else if (isPublished === false) {
      updateData.publishedAt = null;
    }
    return this.prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async deletePost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}

