import { prisma } from './prisma'
import { BlogPost } from './blog-data'
import { PostStatus, QueueStatus } from '@prisma/client'

export class BlogService {
  // Get all published blog posts
  static async getPublishedPosts(limit?: number): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      cacheStrategy: { ttl: 300 }, // Cache for 5 minutes
    })

    return posts.map(this.transformDatabasePost)
  }

  // Get featured blog posts
  static async getFeaturedPosts(): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        featured: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      cacheStrategy: { ttl: 600 }, // Cache for 10 minutes
    })

    return posts.map(this.transformDatabasePost)
  }

  // Get recent posts for homepage
  static async getRecentPosts(limit: number = 3): Promise<BlogPost[]> {
    return this.getPublishedPosts(limit)
  }

  // Get blog post by ID
  static async getPostById(id: string): Promise<BlogPost | null> {
    const post = await prisma.blogPost.findUnique({
      where: {
        id,
        status: PostStatus.PUBLISHED,
      },
      cacheStrategy: { ttl: 300 },
    })

    if (!post) return null

    // Increment view count
    await this.incrementViewCount(id)

    return this.transformDatabasePost(post)
  }

  // Get blog post by slug
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
      },
      cacheStrategy: { ttl: 300 },
    })

    if (!post) return null

    // Increment view count
    await this.incrementViewCount(post.id)

    return this.transformDatabasePost(post)
  }

  // Get posts by category
  static async getPostsByCategory(category: string, limit?: number): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        category,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      cacheStrategy: { ttl: 300 },
    })

    return posts.map(this.transformDatabasePost)
  }

  // Search blog posts
  static async searchPosts(query: string, language: 'en' | 'fr' = 'en'): Promise<BlogPost[]> {
    const searchField = language === 'en' ? 'titleEn' : 'titleFr'
    const contentField = language === 'en' ? 'contentEn' : 'contentFr'

    const posts = await prisma.blogPost.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        OR: [
          {
            [searchField]: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            [contentField]: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              hasSome: [query],
            },
          },
        ],
      },
      orderBy: {
        publishedAt: 'desc',
      },
      cacheStrategy: { ttl: 180 }, // Cache for 3 minutes
    })

    return posts.map(this.transformDatabasePost)
  }

  // Create new blog post
  static async createPost(postData: {
    titleEn: string
    titleFr: string
    excerptEn?: string
    excerptFr?: string
    contentEn: string
    contentFr: string
    metaDescriptionEn?: string
    metaDescriptionFr?: string
    keywords?: string[]
    tags?: string[]
    category?: string
    contentType?: string
    technicalLevel?: string
    targetAudience?: string
    featured?: boolean
    aiGenerated?: boolean
    generationConfig?: any
    aiModel?: string
    generationPrompt?: string
    readTime?: number
    wordCount?: number
    seoScore?: number
    featuredImageUrl?: string
    featuredImageAltEn?: string
    featuredImageAltFr?: string
    featuredImagePrompt?: string
    imageGenerationConfig?: any
  }): Promise<string | null> {
    try {
      const slug = this.generateSlug(postData.titleEn)
      
      const post = await prisma.blogPost.create({
        data: {
          ...postData,
          slug,
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
          keywords: postData.keywords || [],
          tags: postData.tags || [],
        },
      })

      return post.id
    } catch (error) {
      console.error('Error creating post:', error)
      return null
    }
  }

  // Save blog image to database
  static async saveImage(imageData: {
    blogPostId: string
    url: string
    filename: string
    prompt: string
    altTextEn: string
    altTextFr: string
    captionEn?: string
    captionFr?: string
    style: string
    aspectRatio: string
    model: string
    generatedAt: string
    generationConfig?: any
  }): Promise<string | null> {
    try {
      const image = await prisma.blogImage.create({
        data: {
          postId: imageData.blogPostId, // Note: schema uses postId, not blogPostId
          url: imageData.url,
          filename: imageData.filename,
          prompt: imageData.prompt,
          altTextEn: imageData.altTextEn,
          altTextFr: imageData.altTextFr,
          captionEn: imageData.captionEn || '',
          captionFr: imageData.captionFr || '',
          style: imageData.style,
          aspectRatio: imageData.aspectRatio,
          aiModel: imageData.model,
          generationConfig: imageData.generationConfig || {
            model: imageData.model,
            style: imageData.style,
            aspectRatio: imageData.aspectRatio,
            generatedAt: imageData.generatedAt
          },
        },
      })

      console.log(`✅ Image saved to database with ID: ${image.id}`)
      return image.id
    } catch (error) {
      console.error('❌ Error saving image to database:', error)
      return null
    }
  }

  // Get images for a blog post
  static async getPostImages(postId: string) {
    try {
      const images = await prisma.blogImage.findMany({
        where: {
          postId: postId,
          isActive: true
        },
        orderBy: { createdAt: 'desc' },
        cacheStrategy: { ttl: 300 }
      })

      return images.map(image => ({
        id: image.id,
        url: image.url,
        filename: image.filename,
        altText: {
          en: image.altTextEn,
          fr: image.altTextFr
        },
        caption: {
          en: image.captionEn || '',
          fr: image.captionFr || ''
        },
        style: image.style,
        aspectRatio: image.aspectRatio,
        model: image.aiModel, // Use aiModel from schema
        isPrimary: image.imageType === 'featured', // Derive from imageType
        generatedAt: image.createdAt.toISOString() // Use createdAt instead of generatedAt
      }))
    } catch (error) {
      console.error('Error fetching post images:', error)
      return []
    }
  }

  // Update blog post
  static async updatePost(id: string, updates: Partial<{
    titleEn: string
    titleFr: string
    excerptEn: string
    excerptFr: string
    contentEn: string
    contentFr: string
    metaDescriptionEn: string
    metaDescriptionFr: string
    keywords: string[]
    tags: string[]
    category: string
    featured: boolean
    status: PostStatus
    seoScore: number
  }>): Promise<boolean> {
    try {
      await prisma.blogPost.update({
        where: { id },
        data: updates,
      })
      return true
    } catch (error) {
      console.error('Error updating post:', error)
      return false
    }
  }

  // Delete blog post
  static async deletePost(id: string): Promise<boolean> {
    try {
      await prisma.blogPost.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      return false
    }
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    try {
      await prisma.blogPost.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  // Get blog analytics
  static async getPostAnalytics(postId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await prisma.blogAnalytics.findMany({
      where: {
        postId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
      cacheStrategy: { ttl: 300 },
    })
  }

  // Add to generation queue
  static async addToGenerationQueue(queueData: {
    topic: string
    category?: string
    contentType?: string
    targetAudience?: string
    technicalLevel?: string
    scheduledFor: Date
    priority?: number
    generationConfig?: any
    seoKeywords?: string[]
  }): Promise<string | null> {
    try {
      const queueItem = await prisma.generationQueue.create({
        data: {
          topic: queueData.topic,
          category: queueData.category,
          contentType: queueData.contentType || 'article',
          targetAudience: queueData.targetAudience || 'developers',
          technicalLevel: queueData.technicalLevel || 'intermediate',
          scheduledFor: queueData.scheduledFor,
          priority: queueData.priority || 5,
          generationConfig: queueData.generationConfig,
          seoKeywords: queueData.seoKeywords || [],
          status: QueueStatus.PENDING,
        },
      })

      return queueItem.id
    } catch (error) {
      console.error('Error adding to generation queue:', error)
      return null
    }
  }

  // Get pending generation items
  static async getPendingGenerations() {
    return await prisma.generationQueue.findMany({
      where: {
        status: QueueStatus.PENDING,
        scheduledFor: {
          lte: new Date(),
        },
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledFor: 'asc' },
      ],
    })
  }

  // Update generation queue status
  static async updateGenerationStatus(
    id: string,
    status: QueueStatus,
    generatedPostId?: string,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      await prisma.generationQueue.update({
        where: { id },
        data: {
          status,
          generatedPostId,
          errorMessage,
          attempts: status === QueueStatus.FAILED ? { increment: 1 } : undefined,
        },
      })
      return true
    } catch (error) {
      console.error('Error updating generation status:', error)
      return false
    }
  }

  // Get blog categories
  static async getCategories() {
    return await prisma.blogCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      cacheStrategy: { ttl: 3600 }, // Cache for 1 hour
    })
  }

  // Get popular tags
  static async getPopularTags(limit: number = 20) {
    return await prisma.blogTag.findMany({
      orderBy: { usageCount: 'desc' },
      take: limit,
      cacheStrategy: { ttl: 1800 }, // Cache for 30 minutes
    })
  }

  // Helper methods
  private static transformDatabasePost(dbPost: any): BlogPost {
    return {
      id: dbPost.id,
      title: {
        en: dbPost.titleEn,
        fr: dbPost.titleFr,
      },
      excerpt: {
        en: dbPost.excerptEn || '',
        fr: dbPost.excerptFr || '',
      },
      content: {
        en: dbPost.contentEn,
        fr: dbPost.contentFr,
      },
      publishedAt: dbPost.publishedAt?.toISOString().split('T')[0] || dbPost.createdAt.toISOString().split('T')[0],
      tags: dbPost.tags,
      readTime: dbPost.readTime || 5,
      featured: dbPost.featured,
      seo: {
        metaDescription: {
          en: dbPost.metaDescriptionEn || '',
          fr: dbPost.metaDescriptionFr || '',
        },
        keywords: dbPost.keywords,
      },
    }
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
  }
}

export default BlogService
