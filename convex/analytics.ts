import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";

// Analytics interfaces
export interface AnalyticsMetrics {
  totalViews: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceTypes: Record<string, number>;
  countries: Record<string, number>;
}

export interface BlogAnalyticsData {
  postId: string;
  title: string;
  slug: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  shares: number;
  comments: number;
  conversionRate: number;
}

// Query: Get blog analytics summary
export const getBlogAnalytics = query({
  args: {
    timeframe: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"), v.literal("year"))),
    postId: v.optional(v.id("blogPosts")),
  },
  handler: async (ctx, args) => {
    const { timeframe = "month", postId } = args;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get analytics data
    let analyticsQuery = ctx.db
      .query("blogAnalytics")
      .withIndex("by_date", (q) => q.gte("date", startDateStr));
    
    if (postId) {
      analyticsQuery = ctx.db
        .query("blogAnalytics")
        .withIndex("by_post_date", (q) => q.eq("postId", postId).gte("date", startDateStr));
    }
    
    const analytics = await analyticsQuery.collect();
    
    // Aggregate metrics
    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalUniqueViews = analytics.reduce((sum, a) => sum + a.uniqueViews, 0);
    const totalTimeOnPage = analytics.reduce((sum, a) => sum + (a.avgTimeOnPage || 0) * a.views, 0);
    const avgTimeOnPage = totalViews > 0 ? totalTimeOnPage / totalViews : 0;
    const avgBounceRate = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + (a.bounceRate || 0), 0) / analytics.length : 0;
    
    // Get top performing posts
    const postMetrics = new Map<string, { views: number; uniqueViews: number; shares: number; comments: number }>();
    
    for (const analytic of analytics) {
      const existing = postMetrics.get(analytic.postId) || { views: 0, uniqueViews: 0, shares: 0, comments: 0 };
      postMetrics.set(analytic.postId, {
        views: existing.views + analytic.views,
        uniqueViews: existing.uniqueViews + analytic.uniqueViews,
        shares: existing.shares + analytic.shares,
        comments: existing.comments + analytic.comments,
      });
    }
    
    // Get post details for top performers
    const topPosts: BlogAnalyticsData[] = [];
    const sortedPosts = Array.from(postMetrics.entries())
      .sort(([, a], [, b]) => b.views - a.views)
      .slice(0, 10);
    
    for (const [postId, metrics] of sortedPosts) {
      const post = await ctx.db.get(postId as any);
      if (post) {
        topPosts.push({
          postId,
          title: post.titleEn,
          slug: post.slug,
          views: metrics.views,
          uniqueViews: metrics.uniqueViews,
          avgTimeOnPage: avgTimeOnPage,
          bounceRate: avgBounceRate,
          shares: metrics.shares,
          comments: metrics.comments,
          conversionRate: metrics.views > 0 ? (metrics.comments / metrics.views) * 100 : 0,
        });
      }
    }
    
    return {
      timeframe,
      totalViews,
      totalUniqueViews,
      avgTimeOnPage: Math.round(avgTimeOnPage),
      bounceRate: Math.round(avgBounceRate * 100) / 100,
      topPosts,
      totalPosts: postMetrics.size,
      totalShares: analytics.reduce((sum, a) => sum + a.shares, 0),
      totalComments: analytics.reduce((sum, a) => sum + a.comments, 0),
    };
  },
});

// Query: Get SEO metrics
export const getSeoMetrics = query({
  args: {
    postId: v.optional(v.id("blogPosts")),
    keyword: v.optional(v.string()),
    timeframe: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("quarter"))),
  },
  handler: async (ctx, args) => {
    const { postId, keyword, timeframe = "month" } = args;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Build query
    let seoQuery = ctx.db
      .query("seoMetrics")
      .filter((q) => q.gte(q.field("date"), startDateStr));
    
    if (postId) {
      seoQuery = ctx.db
        .query("seoMetrics")
        .withIndex("by_post", (q) => q.eq("postId", postId))
        .filter((q) => q.gte(q.field("date"), startDateStr));
    }
    
    if (keyword) {
      seoQuery = ctx.db
        .query("seoMetrics")
        .withIndex("by_keyword", (q) => q.eq("keyword", keyword))
        .filter((q) => q.gte(q.field("date"), startDateStr));
    }
    
    const seoMetrics = await seoQuery.collect();
    
    // Aggregate SEO data
    const totalClicks = seoMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalImpressions = seoMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // Calculate average position
    const positionMetrics = seoMetrics.filter(m => m.position);
    const avgPosition = positionMetrics.length > 0 ? 
      positionMetrics.reduce((sum, m) => sum + (m.position || 0), 0) / positionMetrics.length : 0;
    
    // Top keywords
    const keywordMetrics = new Map<string, { clicks: number; impressions: number; position: number }>();
    
    for (const metric of seoMetrics) {
      const existing = keywordMetrics.get(metric.keyword) || { clicks: 0, impressions: 0, position: 0 };
      keywordMetrics.set(metric.keyword, {
        clicks: existing.clicks + metric.clicks,
        impressions: existing.impressions + metric.impressions,
        position: metric.position || existing.position,
      });
    }
    
    const topKeywords = Array.from(keywordMetrics.entries())
      .map(([keyword, data]) => ({
        keyword,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.position,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);
    
    return {
      timeframe,
      totalClicks,
      totalImpressions,
      avgCTR: Math.round(avgCTR * 100) / 100,
      avgPosition: Math.round(avgPosition * 10) / 10,
      topKeywords,
      totalKeywords: keywordMetrics.size,
    };
  },
});

// Mutation: Track page view
export const trackPageView = mutation({
  args: {
    postId: v.optional(v.id("blogPosts")),
    page: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    sessionId: v.string(),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { postId, page, referrer, userAgent, sessionId, timestamp = Date.now() } = args;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (postId) {
      // Check if analytics record exists for today
      const existingAnalytics = await ctx.db
        .query("blogAnalytics")
        .withIndex("by_post_date", (q) => q.eq("postId", postId).eq("date", today))
        .first();
      
      if (existingAnalytics) {
        // Update existing record
        await ctx.db.patch(existingAnalytics._id, {
          views: existingAnalytics.views + 1,
          // Note: In production, you'd track unique views more sophisticated
          uniqueViews: existingAnalytics.uniqueViews + 1,
        });
      } else {
        // Create new analytics record
        await ctx.db.insert("blogAnalytics", {
          postId,
          date: today,
          views: 1,
          uniqueViews: 1,
          shares: 0,
          comments: 0,
          interactions: 0,
          organicTraffic: referrer?.includes('google') ? 1 : 0,
          directTraffic: !referrer ? 1 : 0,
          socialTraffic: referrer?.includes('facebook') || referrer?.includes('twitter') ? 1 : 0,
          referralTraffic: referrer && !referrer.includes('google') && !referrer.includes('facebook') && !referrer.includes('twitter') ? 1 : 0,
        });
      }
      
      // Update post view count
      const post = await ctx.db.get(postId);
      if (post) {
        await ctx.db.patch(postId, {
          viewCount: post.viewCount + 1,
        });
      }
    }
    
    return {
      success: true,
      timestamp,
      page,
      sessionId,
    };
  },
});

// Mutation: Track interaction (like, share, comment)
export const trackInteraction = mutation({
  args: {
    postId: v.id("blogPosts"),
    type: v.union(v.literal("like"), v.literal("share"), v.literal("comment")),
    sessionId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { postId, type, sessionId, metadata } = args;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Update analytics
    const existingAnalytics = await ctx.db
      .query("blogAnalytics")
      .withIndex("by_post_date", (q) => q.eq("postId", postId).eq("date", today))
      .first();
    
    if (existingAnalytics) {
      const updates: any = {
        interactions: existingAnalytics.interactions + 1,
      };
      
      if (type === "like") {
        // Note: In production, you'd prevent duplicate likes per session
      } else if (type === "share") {
        updates.shares = existingAnalytics.shares + 1;
      } else if (type === "comment") {
        updates.comments = existingAnalytics.comments + 1;
      }
      
      await ctx.db.patch(existingAnalytics._id, updates);
    }
    
    // Update post counts
    const post = await ctx.db.get(postId);
    if (post) {
      const updates: any = {};
      
      if (type === "like") {
        updates.likeCount = post.likeCount + 1;
      } else if (type === "share") {
        updates.shareCount = post.shareCount + 1;
      }
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(postId, updates);
      }
    }
    
    return {
      success: true,
      type,
      postId,
      timestamp: Date.now(),
    };
  },
});

// Query: Get real-time dashboard metrics
export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Today's analytics
    const todayAnalytics = await ctx.db
      .query("blogAnalytics")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();
    
    // Yesterday's analytics for comparison
    const yesterdayAnalytics = await ctx.db
      .query("blogAnalytics")
      .withIndex("by_date", (q) => q.eq("date", yesterday))
      .collect();
    
    // Calculate metrics
    const todayViews = todayAnalytics.reduce((sum, a) => sum + a.views, 0);
    const yesterdayViews = yesterdayAnalytics.reduce((sum, a) => sum + a.views, 0);
    const viewsChange = yesterdayViews > 0 ? ((todayViews - yesterdayViews) / yesterdayViews) * 100 : 0;
    
    const todayShares = todayAnalytics.reduce((sum, a) => sum + a.shares, 0);
    const yesterdayShares = yesterdayAnalytics.reduce((sum, a) => sum + a.shares, 0);
    const sharesChange = yesterdayShares > 0 ? ((todayShares - yesterdayShares) / yesterdayShares) * 100 : 0;
    
    // Get total counts
    const totalPosts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
      .collect();
    
    const totalProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    const totalLeads = await ctx.db
      .query("leads")
      .collect();
    
    return {
      today: {
        views: todayViews,
        shares: todayShares,
        comments: todayAnalytics.reduce((sum, a) => sum + a.comments, 0),
        interactions: todayAnalytics.reduce((sum, a) => sum + a.interactions, 0),
      },
      changes: {
        views: Math.round(viewsChange * 100) / 100,
        shares: Math.round(sharesChange * 100) / 100,
      },
      totals: {
        posts: totalPosts.length,
        projects: totalProjects.length,
        leads: totalLeads.length,
      },
      timestamp: Date.now(),
    };
  },
});
