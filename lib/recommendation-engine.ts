// Smart Content Recommendations Engine using real data
import { PrismaClient } from '@prisma/client'
import { BlogService } from './blog-service'
import aiModelManager from './ai-model-manager'
import { withCache, CACHE_KEYS, CACHE_TTL } from './cache'

const prisma = new PrismaClient()

export interface UserBehavior {
  sessionId: string
  userId?: string
  pageViews: string[]
  timeSpent: Record<string, number>
  interactions: string[]
  searchQueries: string[]
  preferredLanguage: 'en' | 'fr'
  interests: string[]
  lastActivity: Date
}

export interface ContentRecommendation {
  id: string
  type: 'blog_post' | 'service' | 'project'
  title: string
  excerpt: string
  url: string
  score: number
  reason: string
  tags: string[]
  readTime?: number
  category?: string
}

export interface RecommendationContext {
  currentPage: string
  userBehavior: UserBehavior
  locale: 'en' | 'fr'
  limit?: number
}

class RecommendationEngine {
  private behaviorStore = new Map<string, UserBehavior>()

  // Track user behavior
  async trackBehavior(sessionId: string, action: {
    type: 'page_view' | 'interaction' | 'search' | 'time_spent'
    page?: string
    query?: string
    duration?: number
    data?: any
  }) {
    let behavior = this.behaviorStore.get(sessionId)
    
    if (!behavior) {
      behavior = {
        sessionId,
        pageViews: [],
        timeSpent: {},
        interactions: [],
        searchQueries: [],
        preferredLanguage: 'en',
        interests: [],
        lastActivity: new Date()
      }
    }

    switch (action.type) {
      case 'page_view':
        if (action.page && !behavior.pageViews.includes(action.page)) {
          behavior.pageViews.push(action.page)
        }
        break
      
      case 'time_spent':
        if (action.page && action.duration) {
          behavior.timeSpent[action.page] = (behavior.timeSpent[action.page] || 0) + action.duration
        }
        break
      
      case 'search':
        if (action.query) {
          behavior.searchQueries.push(action.query)
        }
        break
      
      case 'interaction':
        if (action.data) {
          behavior.interactions.push(JSON.stringify(action.data))
        }
        break
    }

    behavior.lastActivity = new Date()
    this.behaviorStore.set(sessionId, behavior)

    // Extract interests from behavior
    await this.updateUserInterests(behavior)
  }

  // Update user interests based on behavior
  private async updateUserInterests(behavior: UserBehavior) {
    const interests = new Set<string>()

    // Extract interests from page views
    behavior.pageViews.forEach(page => {
      if (page.includes('services')) interests.add('services')
      if (page.includes('projects')) interests.add('portfolio')
      if (page.includes('blog')) interests.add('content')
      if (page.includes('contact')) interests.add('consultation')
    })

    // Extract interests from search queries
    behavior.searchQueries.forEach(query => {
      const lowerQuery = query.toLowerCase()
      if (lowerQuery.includes('web')) interests.add('web-development')
      if (lowerQuery.includes('ai') || lowerQuery.includes('artificial')) interests.add('ai')
      if (lowerQuery.includes('mobile') || lowerQuery.includes('app')) interests.add('mobile')
      if (lowerQuery.includes('react') || lowerQuery.includes('next')) interests.add('react')
      if (lowerQuery.includes('design') || lowerQuery.includes('ui')) interests.add('design')
    })

    behavior.interests = Array.from(interests)
  }

  // Get personalized content recommendations
  async getRecommendations(context: RecommendationContext): Promise<ContentRecommendation[]> {
    const cacheKey = `recommendations:${context.userBehavior.sessionId}:${context.currentPage}:${context.locale}`
    
    return withCache(
      cacheKey,
      async () => {
        const recommendations: ContentRecommendation[] = []

        // Get blog post recommendations
        const blogRecommendations = await this.getBlogRecommendations(context)
        recommendations.push(...blogRecommendations)

        // Get service recommendations
        const serviceRecommendations = await this.getServiceRecommendations(context)
        recommendations.push(...serviceRecommendations)

        // Get project recommendations
        const projectRecommendations = await this.getProjectRecommendations(context)
        recommendations.push(...projectRecommendations)

        // Sort by score and limit results
        return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, context.limit || 6)
      },
      CACHE_TTL.BLOG_POSTS
    )
  }

  // Get blog post recommendations based on user behavior
  private async getBlogRecommendations(context: RecommendationContext): Promise<ContentRecommendation[]> {
    try {
      const { userBehavior, locale, currentPage } = context
      const recommendations: ContentRecommendation[] = []

      // Get all published blog posts
      const blogPosts = await BlogService.getPublishedPosts(20)

      for (const post of blogPosts) {
        let score = 0
        let reason = ''

        // Base score for all posts
        score += 10

        // Boost featured posts
        if (post.featured) {
          score += 20
          reason = locale === 'fr' ? 'Article en vedette' : 'Featured article'
        }

        // Interest-based scoring
        const postTags = post.tags.map(tag => tag.toLowerCase())
        const userInterests = userBehavior.interests.map(interest => interest.toLowerCase())
        
        const matchingInterests = postTags.filter(tag => 
          userInterests.some(interest => tag.includes(interest) || interest.includes(tag))
        )

        if (matchingInterests.length > 0) {
          score += matchingInterests.length * 15
          reason = locale === 'fr' 
            ? `Correspond à vos intérêts: ${matchingInterests.join(', ')}`
            : `Matches your interests: ${matchingInterests.join(', ')}`
        }

        // Search query relevance
        for (const query of userBehavior.searchQueries) {
          const queryLower = query.toLowerCase()
          const titleLower = post.title[locale].toLowerCase()
          const excerptLower = post.excerpt[locale].toLowerCase()
          
          if (titleLower.includes(queryLower) || excerptLower.includes(queryLower)) {
            score += 25
            reason = locale === 'fr' 
              ? `Pertinent pour votre recherche: "${query}"`
              : `Relevant to your search: "${query}"`
          }
        }

        // Page context relevance
        if (currentPage === 'services' && postTags.some(tag => 
          ['web-development', 'ai', 'mobile', 'consulting'].includes(tag.toLowerCase())
        )) {
          score += 15
          reason = locale === 'fr' ? 'Lié aux services' : 'Related to services'
        }

        if (currentPage === 'projects' && postTags.some(tag => 
          ['portfolio', 'case-study', 'project'].includes(tag.toLowerCase())
        )) {
          score += 15
          reason = locale === 'fr' ? 'Lié aux projets' : 'Related to projects'
        }

        // Recent posts get slight boost
        const publishedDate = new Date(post.publishedAt)
        const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSincePublished < 30) {
          score += 5
        }

        // Only include posts with meaningful scores
        if (score > 15) {
          recommendations.push({
            id: post.id,
            type: 'blog_post',
            title: post.title[locale],
            excerpt: post.excerpt[locale],
            url: `/blog/${post.id}`,
            score,
            reason: reason || (locale === 'fr' ? 'Article recommandé' : 'Recommended article'),
            tags: post.tags,
            readTime: post.readTime,
            category: 'blog'
          })
        }
      }

      return recommendations
    } catch (error) {
      console.error('Error getting blog recommendations:', error)
      return []
    }
  }

  // Get service recommendations
  private async getServiceRecommendations(context: RecommendationContext): Promise<ContentRecommendation[]> {
    const { userBehavior, locale } = context
    const recommendations: ContentRecommendation[] = []

    const services = [
      {
        id: 'web-development',
        title: locale === 'fr' ? 'Développement Web' : 'Web Development',
        excerpt: locale === 'fr' 
          ? 'Applications web modernes avec React, Next.js et technologies avancées'
          : 'Modern web applications with React, Next.js and advanced technologies',
        tags: ['web-development', 'react', 'nextjs'],
        interests: ['web-development', 'react', 'services']
      },
      {
        id: 'ai-solutions',
        title: locale === 'fr' ? 'Solutions IA' : 'AI Solutions',
        excerpt: locale === 'fr'
          ? 'Intégration d\'intelligence artificielle pour automatiser et optimiser vos processus'
          : 'AI integration to automate and optimize your business processes',
        tags: ['ai', 'automation', 'machine-learning'],
        interests: ['ai', 'automation', 'services']
      },
      {
        id: 'mobile-development',
        title: locale === 'fr' ? 'Développement Mobile' : 'Mobile Development',
        excerpt: locale === 'fr'
          ? 'Applications mobiles natives et cross-platform pour iOS et Android'
          : 'Native and cross-platform mobile applications for iOS and Android',
        tags: ['mobile', 'ios', 'android', 'react-native'],
        interests: ['mobile', 'app', 'services']
      },
      {
        id: 'consulting',
        title: locale === 'fr' ? 'Conseil Technique' : 'Technical Consulting',
        excerpt: locale === 'fr'
          ? 'Expertise technique et conseils stratégiques pour vos projets technologiques'
          : 'Technical expertise and strategic advice for your technology projects',
        tags: ['consulting', 'strategy', 'architecture'],
        interests: ['consultation', 'strategy', 'services']
      }
    ]

    for (const service of services) {
      let score = 0
      let reason = ''

      // Interest-based scoring
      const matchingInterests = service.interests.filter(interest => 
        userBehavior.interests.includes(interest)
      )

      if (matchingInterests.length > 0) {
        score += matchingInterests.length * 20
        reason = locale === 'fr' 
          ? `Correspond à vos intérêts: ${matchingInterests.join(', ')}`
          : `Matches your interests: ${matchingInterests.join(', ')}`
      }

      // Search query relevance
      for (const query of userBehavior.searchQueries) {
        const queryLower = query.toLowerCase()
        if (service.tags.some(tag => queryLower.includes(tag) || tag.includes(queryLower))) {
          score += 30
          reason = locale === 'fr' 
            ? `Pertinent pour votre recherche: "${query}"`
            : `Relevant to your search: "${query}"`
        }
      }

      // Page view relevance
      if (userBehavior.pageViews.includes('services')) {
        score += 15
      }

      if (score > 0) {
        recommendations.push({
          id: service.id,
          type: 'service',
          title: service.title,
          excerpt: service.excerpt,
          url: '/services',
          score,
          reason: reason || (locale === 'fr' ? 'Service recommandé' : 'Recommended service'),
          tags: service.tags,
          category: 'service'
        })
      }
    }

    return recommendations
  }

  // Get project recommendations
  private async getProjectRecommendations(context: RecommendationContext): Promise<ContentRecommendation[]> {
    const { userBehavior, locale } = context
    const recommendations: ContentRecommendation[] = []

    // This would typically fetch from a projects database
    // For now, using representative project types
    const projectTypes = [
      {
        id: 'web-applications',
        title: locale === 'fr' ? 'Applications Web' : 'Web Applications',
        excerpt: locale === 'fr'
          ? 'Découvrez nos applications web innovantes et performantes'
          : 'Explore our innovative and high-performance web applications',
        tags: ['web', 'react', 'nextjs'],
        interests: ['web-development', 'portfolio']
      },
      {
        id: 'ai-projects',
        title: locale === 'fr' ? 'Projets IA' : 'AI Projects',
        excerpt: locale === 'fr'
          ? 'Projets d\'intelligence artificielle et d\'automatisation'
          : 'Artificial intelligence and automation projects',
        tags: ['ai', 'machine-learning', 'automation'],
        interests: ['ai', 'portfolio']
      },
      {
        id: 'mobile-apps',
        title: locale === 'fr' ? 'Applications Mobiles' : 'Mobile Apps',
        excerpt: locale === 'fr'
          ? 'Applications mobiles natives et cross-platform'
          : 'Native and cross-platform mobile applications',
        tags: ['mobile', 'ios', 'android'],
        interests: ['mobile', 'portfolio']
      }
    ]

    for (const project of projectTypes) {
      let score = 0
      let reason = ''

      // Interest-based scoring
      const matchingInterests = project.interests.filter(interest => 
        userBehavior.interests.includes(interest)
      )

      if (matchingInterests.length > 0) {
        score += matchingInterests.length * 15
        reason = locale === 'fr' 
          ? `Correspond à vos intérêts: ${matchingInterests.join(', ')}`
          : `Matches your interests: ${matchingInterests.join(', ')}`
      }

      // Page view relevance
      if (userBehavior.pageViews.includes('projects')) {
        score += 20
      }

      if (score > 0) {
        recommendations.push({
          id: project.id,
          type: 'project',
          title: project.title,
          excerpt: project.excerpt,
          url: '/projects',
          score,
          reason: reason || (locale === 'fr' ? 'Projet recommandé' : 'Recommended project'),
          tags: project.tags,
          category: 'project'
        })
      }
    }

    return recommendations
  }

  // Get AI-powered recommendations using Gemini
  async getAIRecommendations(context: RecommendationContext): Promise<ContentRecommendation[]> {
    try {
      const { userBehavior, locale, currentPage } = context

      const prompt = `
Based on the following user behavior, recommend relevant content:

User Behavior:
- Current Page: ${currentPage}
- Page Views: ${userBehavior.pageViews.join(', ')}
- Interests: ${userBehavior.interests.join(', ')}
- Search Queries: ${userBehavior.searchQueries.join(', ')}
- Language: ${locale}

Available Content Types:
- Blog posts about web development, AI, mobile development, consulting
- Services: Web Development, AI Solutions, Mobile Development, Technical Consulting
- Projects: Web Applications, AI Projects, Mobile Apps

Please recommend 3-5 pieces of content that would be most relevant to this user.
Respond in ${locale === 'fr' ? 'French' : 'English'} with a JSON array of recommendations.
Each recommendation should have: title, excerpt, type, reason, score (1-100).
`

      const aiResponse = await aiModelManager.generateResponse(prompt, 'recommendations')
      
      // Parse AI response and convert to recommendations
      try {
        const aiRecommendations = JSON.parse(aiResponse.content)
        return aiRecommendations.map((rec: any, index: number) => ({
          id: `ai-rec-${index}`,
          type: rec.type || 'blog_post',
          title: rec.title,
          excerpt: rec.excerpt,
          url: rec.type === 'service' ? '/services' : rec.type === 'project' ? '/projects' : '/blog',
          score: rec.score || 50,
          reason: rec.reason,
          tags: [],
          category: 'ai-recommended'
        }))
      } catch (parseError) {
        console.error('Error parsing AI recommendations:', parseError)
        return []
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error)
      return []
    }
  }

  // Get user behavior
  getUserBehavior(sessionId: string): UserBehavior | null {
    return this.behaviorStore.get(sessionId) || null
  }

  // Clear old behavior data (cleanup)
  cleanupOldBehavior() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    for (const [sessionId, behavior] of this.behaviorStore.entries()) {
      if (behavior.lastActivity < oneDayAgo) {
        this.behaviorStore.delete(sessionId)
      }
    }
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine()

// Cleanup old behavior data every hour
setInterval(() => {
  recommendationEngine.cleanupOldBehavior()
}, 60 * 60 * 1000)

export default recommendationEngine
