import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// User behavior tracking interface
export interface UserBehavior {
  sessionId: string;
  userId?: string;
  pageViews: string[];
  timeSpent: Record<string, number>;
  interactions: string[];
  searchQueries: string[];
  preferredLanguage: 'en' | 'fr';
  interests: string[];
  lastActivity: number;
}

// Content recommendation interface
export interface ContentRecommendation {
  id: string;
  type: 'blog_post' | 'service' | 'project';
  title: string;
  excerpt: string;
  url: string;
  score: number;
  reason: string;
  tags: string[];
  readTime?: number;
  category?: string;
}

// Query: Get personalized recommendations
export const getRecommendations = query({
  args: {
    sessionId: v.string(),
    currentPage: v.optional(v.string()),
    locale: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sessionId, currentPage, locale = 'en', limit = 5 } = args;
    
    // Get user behavior (would be stored in a separate table in production)
    const userBehavior = await getUserBehavior(ctx, sessionId);
    
    // Get content recommendations based on behavior
    const recommendations: ContentRecommendation[] = [];
    
    // Get blog posts
    const blogPosts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
      .order("desc")
      .take(20);
    
    // Get projects
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .take(10);
    
    // Score and rank blog posts
    for (const post of blogPosts) {
      let score = 0;
      let reason = "General recommendation";
      
      // Interest-based scoring
      if (userBehavior?.interests) {
        const commonInterests = post.tags.filter(tag => 
          userBehavior.interests.some(interest => 
            interest.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        );
        score += commonInterests.length * 20;
        if (commonInterests.length > 0) {
          reason = `Based on your interest in ${commonInterests.join(', ')}`;
        }
      }
      
      // Category-based scoring
      if (userBehavior?.pageViews) {
        const categoryViews = userBehavior.pageViews.filter(page => 
          page.includes(post.category) || page.includes('blog')
        );
        score += categoryViews.length * 10;
      }
      
      // Recency bonus
      const daysSincePublished = post.publishedAt ? 
        (Date.now() - post.publishedAt) / (1000 * 60 * 60 * 24) : 999;
      if (daysSincePublished < 7) score += 15;
      else if (daysSincePublished < 30) score += 10;
      
      // Featured content bonus
      if (post.featured) score += 25;
      
      // Language preference
      const title = locale === 'fr' ? post.titleFr : post.titleEn;
      const excerpt = locale === 'fr' ? post.excerptFr : post.excerptEn;
      
      if (score > 0 || recommendations.length < limit) {
        recommendations.push({
          id: post._id,
          type: 'blog_post',
          title: title || post.titleEn,
          excerpt: excerpt || post.excerptEn || `Learn about ${post.category}`,
          url: `/blog/${post.slug}`,
          score: Math.max(score, 1),
          reason,
          tags: post.tags,
          readTime: post.readTime,
          category: post.category,
        });
      }
    }
    
    // Score and rank projects
    for (const project of projects) {
      let score = 0;
      let reason = "Featured project";
      
      // Technology-based scoring
      if (userBehavior?.interests) {
        const commonTech = project.technologies.filter(tech => 
          userBehavior.interests.some(interest => 
            interest.toLowerCase().includes(tech.toLowerCase()) ||
            tech.toLowerCase().includes(interest.toLowerCase())
          )
        );
        score += commonTech.length * 15;
        if (commonTech.length > 0) {
          reason = `Uses ${commonTech.join(', ')} technology`;
        }
      }
      
      // Featured project bonus
      if (project.featured) score += 20;
      
      // Recent project bonus
      const daysSinceUpdate = project.endDate ? 
        (Date.now() - project.endDate) / (1000 * 60 * 60 * 24) : 0;
      if (daysSinceUpdate < 90) score += 10;
      
      const title = locale === 'fr' ? project.titleFr : project.titleEn;
      const excerpt = locale === 'fr' ? project.shortDescFr : project.shortDescEn;
      
      if (score > 0 || recommendations.length < limit) {
        recommendations.push({
          id: project._id,
          type: 'project',
          title: title || project.titleEn,
          excerpt: excerpt || project.shortDescEn || `${project.category} project`,
          url: `/projects/${project.slug}`,
          score: Math.max(score, 1),
          reason,
          tags: project.technologies,
          category: project.category,
        });
      }
    }
    
    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
});

// Mutation: Track user behavior
export const trackBehavior = mutation({
  args: {
    sessionId: v.string(),
    action: v.object({
      type: v.union(
        v.literal("page_view"),
        v.literal("interaction"),
        v.literal("search"),
        v.literal("time_spent")
      ),
      page: v.optional(v.string()),
      query: v.optional(v.string()),
      duration: v.optional(v.number()),
      data: v.optional(v.any()),
    }),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionId, action, locale = 'en' } = args;
    
    // In a production system, this would update a user behavior table
    // For now, we'll return a success response
    
    return {
      sessionId,
      action: action.type,
      timestamp: Date.now(),
      locale,
      success: true,
    };
  },
});

// Helper function to get user behavior (placeholder)
async function getUserBehavior(ctx: any, sessionId: string): Promise<UserBehavior | null> {
  // In production, this would query a user behavior table
  // For now, return a mock behavior based on session
  
  const mockBehaviors: Record<string, UserBehavior> = {
    'developer': {
      sessionId,
      pageViews: ['/blog', '/projects', '/blog/react-tutorial'],
      timeSpent: { '/blog': 120, '/projects': 180 },
      interactions: ['like', 'share'],
      searchQueries: ['react', 'typescript', 'nextjs'],
      preferredLanguage: 'en',
      interests: ['react', 'typescript', 'web development', 'frontend'],
      lastActivity: Date.now() - 3600000, // 1 hour ago
    },
    'client': {
      sessionId,
      pageViews: ['/services', '/portfolio', '/contact'],
      timeSpent: { '/services': 90, '/portfolio': 150 },
      interactions: ['contact_form'],
      searchQueries: ['web design', 'portfolio'],
      preferredLanguage: 'en',
      interests: ['web design', 'business', 'portfolio'],
      lastActivity: Date.now() - 1800000, // 30 minutes ago
    },
  };
  
  // Simple session-based behavior detection
  if (sessionId.includes('dev')) return mockBehaviors.developer;
  if (sessionId.includes('client')) return mockBehaviors.client;
  
  return null;
}

// Query: Get trending content
export const getTrendingContent = query({
  args: {
    type: v.optional(v.union(v.literal("blog"), v.literal("projects"), v.literal("all"))),
    timeframe: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type = "all", timeframe = "week", limit = 10 } = args;
    
    const trending: ContentRecommendation[] = [];
    
    if (type === "blog" || type === "all") {
      const posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
        .order("desc")
        .take(20);
      
      // Sort by engagement metrics (views, likes, shares)
      const trendingPosts = posts
        .sort((a, b) => (b.viewCount + b.likeCount + b.shareCount) - (a.viewCount + a.likeCount + a.shareCount))
        .slice(0, Math.ceil(limit / (type === "all" ? 2 : 1)));
      
      for (const post of trendingPosts) {
        trending.push({
          id: post._id,
          type: 'blog_post',
          title: post.titleEn,
          excerpt: post.excerptEn || `Learn about ${post.category}`,
          url: `/blog/${post.slug}`,
          score: post.viewCount + post.likeCount + post.shareCount,
          reason: "Trending content",
          tags: post.tags,
          readTime: post.readTime,
          category: post.category,
        });
      }
    }
    
    if (type === "projects" || type === "all") {
      const projects = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("active"), true))
        .order("desc")
        .take(10);
      
      // Sort by engagement metrics
      const trendingProjects = projects
        .sort((a, b) => (b.viewCount + b.likeCount) - (a.viewCount + a.likeCount))
        .slice(0, Math.ceil(limit / (type === "all" ? 2 : 1)));
      
      for (const project of trendingProjects) {
        trending.push({
          id: project._id,
          type: 'project',
          title: project.titleEn,
          excerpt: project.shortDescEn || `${project.category} project`,
          url: `/projects/${project.slug}`,
          score: project.viewCount + project.likeCount,
          reason: "Popular project",
          tags: project.technologies,
          category: project.category,
        });
      }
    }
    
    return trending
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
});
