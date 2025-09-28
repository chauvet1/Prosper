import { BlogPost } from './blog-data'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export class BlogService {
  // Get all published blog posts
  static async getPublishedPosts(limit?: number): Promise<BlogPost[]> {
    const posts = await convex.query(api.blog.getPublishedPosts, { limit })
    return posts.map(this.transformDatabasePost)
  }

  // Get featured blog posts
  static async getFeaturedPosts(): Promise<BlogPost[]> {
    const posts = await convex.query(api.blog.getFeaturedPosts, {})
    return posts.map(this.transformDatabasePost)
  }

  // Get recent posts for homepage
  static async getRecentPosts(limit: number = 3): Promise<BlogPost[]> {
    return this.getPublishedPosts(limit)
  }

  // Get blog post by ID
  static async getPostById(id: string): Promise<BlogPost | null> {
    const post = await convex.query(api.blog.getPostById, { id })

    if (!post) return null

    // Increment view count
    await this.incrementViewCount(id)

    return this.transformDatabasePost(post)
  }

  // Get blog post by slug
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const post = await convex.query(api.blog.getPostBySlug, { slug })

    if (!post) return null

    // Increment view count
    await this.incrementViewCount(post.id)

    return this.transformDatabasePost(post)
  }

  // Get posts by category
  static async getPostsByCategory(category: string, limit?: number): Promise<BlogPost[]> {
    const posts = await convex.query(api.blog.getPostsByCategory, { category, limit })
    return posts.map(this.transformDatabasePost)
  }

  // Search blog posts
  static async searchPosts(query: string, language: 'en' | 'fr' = 'en'): Promise<BlogPost[]> {
    const posts = await convex.query(api.blog.searchPosts, { query, language })
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
      const result = await convex.mutation(api.blog.createPost, postData)
      return result
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
      const result = await convex.mutation(api.blog.saveImage, imageData)
      console.log(`✅ Image saved to database with ID: ${result}`)
      return result
    } catch (error) {
      console.error('❌ Error saving image to database:', error)
      return null
    }
  }

  // Get images for a blog post
  static async getPostImages(postId: string) {
    try {
      const images = await convex.query(api.blog.getPostImages, { postId })
      return images
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
    status: string
    seoScore: number
  }>): Promise<boolean> {
    try {
      await convex.mutation(api.blog.updatePost, { id, updates })
      return true
    } catch (error) {
      console.error('Error updating post:', error)
      return false
    }
  }

  // Delete blog post
  static async deletePost(id: string): Promise<boolean> {
    try {
      await convex.mutation(api.blog.deletePost, { id })
      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      return false
    }
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    try {
      await convex.mutation(api.blog.incrementViewCount, { id })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  // Get blog analytics
  static async getPostAnalytics(postId: string, days: number = 30) {
    return await convex.query(api.blog.getPostAnalytics, { postId, days })
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
      const result = await convex.mutation(api.blog.addToGenerationQueue, queueData)
      return result
    } catch (error) {
      console.error('Error adding to generation queue:', error)
      return null
    }
  }

  // Get pending generation items
  static async getPendingGenerations() {
    return await convex.query(api.blog.getPendingGenerations, {})
  }

  // Update generation queue status
  static async updateGenerationStatus(
    id: string,
    status: string,
    generatedPostId?: string,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      await convex.mutation(api.blog.updateGenerationStatus, { id, status, generatedPostId, errorMessage })
      return true
    } catch (error) {
      console.error('Error updating generation status:', error)
      return false
    }
  }

  // Get blog categories
  static async getCategories() {
    return await convex.query(api.blog.getCategories, {})
  }

  // Get popular tags
  static async getPopularTags(limit: number = 20) {
    return await convex.query(api.blog.getPopularTags, { limit })
  }

  // Helper methods
  private static transformDatabasePost(dbPost: any): BlogPost {
    return {
      id: dbPost._id,
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
      publishedAt: dbPost.publishedAt ? new Date(dbPost.publishedAt).toISOString().split('T')[0] : new Date(dbPost._creationTime).toISOString().split('T')[0],
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
