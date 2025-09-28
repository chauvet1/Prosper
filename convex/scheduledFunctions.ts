import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { api } from "./_generated/api";

// Internal action: Aggregate daily analytics
export const aggregateDailyAnalytics = internalAction({
  args: {},
  handler: async (ctx) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log(`Aggregating analytics for ${yesterdayStr}`);
    
    // Get all analytics for yesterday
    const analytics = await ctx.runQuery(api.analytics.getBlogAnalytics, {
      timeframe: "day",
    });
    
    // Log aggregation results
    console.log(`Processed ${analytics.totalPosts} posts with ${analytics.totalViews} total views`);
    
    return {
      date: yesterdayStr,
      totalViews: analytics.totalViews,
      totalPosts: analytics.totalPosts,
      processed: true,
    };
  },
});

// Internal action: Generate weekly SEO report
export const generateWeeklySeoReport = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Generating weekly SEO report");
    
    // Get SEO metrics for the past week
    const seoMetrics = await ctx.runQuery(api.analytics.getSeoMetrics, {
      timeframe: "week",
    });
    
    // Generate report summary
    const report = {
      week: new Date().toISOString().split('T')[0],
      totalClicks: seoMetrics.totalClicks,
      totalImpressions: seoMetrics.totalImpressions,
      avgCTR: seoMetrics.avgCTR,
      avgPosition: seoMetrics.avgPosition,
      topKeywords: seoMetrics.topKeywords.slice(0, 10),
      generatedAt: Date.now(),
    };
    
    console.log(`SEO Report: ${report.totalClicks} clicks, ${report.totalImpressions} impressions, ${report.avgCTR}% CTR`);
    
    return report;
  },
});

// Internal action: Monthly content performance review
export const monthlyContentReview = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Conducting monthly content performance review");
    
    // Get analytics for the past month
    const analytics = await ctx.runQuery(api.analytics.getBlogAnalytics, {
      timeframe: "month",
    });
    
    // Identify top and bottom performing content
    const topPosts = analytics.topPosts.slice(0, 5);
    const lowPerformingPosts = analytics.topPosts.slice(-5);
    
    const review = {
      month: new Date().toISOString().substring(0, 7), // YYYY-MM format
      totalViews: analytics.totalViews,
      totalPosts: analytics.totalPosts,
      avgTimeOnPage: analytics.avgTimeOnPage,
      bounceRate: analytics.bounceRate,
      topPerformers: topPosts,
      needsImprovement: lowPerformingPosts,
      generatedAt: Date.now(),
    };
    
    console.log(`Monthly Review: ${review.totalViews} views across ${review.totalPosts} posts`);
    
    return review;
  },
});

// Internal mutation: Update lead scores
export const updateLeadScores = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Updating lead scores");
    
    // Get all leads
    const leads = await ctx.db.query("leads").collect();
    
    let updatedCount = 0;
    
    for (const lead of leads) {
      let newScore = lead.leadScore;
      
      // Scoring algorithm
      // Recent activity bonus
      const daysSinceCreation = (Date.now() - lead._creationTime) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) newScore += 10;
      
      // Status-based scoring
      switch (lead.status) {
        case "QUALIFIED":
          newScore += 20;
          break;
        case "PROPOSAL_SENT":
          newScore += 30;
          break;
        case "NEGOTIATING":
          newScore += 40;
          break;
        case "CONVERTED":
          newScore = 100;
          break;
        case "LOST":
        case "UNQUALIFIED":
          newScore = Math.max(newScore - 20, 0);
          break;
      }
      
      // Company presence bonus
      if (lead.company) newScore += 5;
      if (lead.phone) newScore += 5;
      if (lead.projectRequirements) newScore += 10;
      
      // Cap the score at 100
      newScore = Math.min(newScore, 100);
      
      // Update if score changed
      if (newScore !== lead.leadScore) {
        await ctx.db.patch(lead._id, { leadScore: newScore });
        updatedCount++;
      }
    }
    
    console.log(`Updated scores for ${updatedCount} leads`);
    
    return {
      totalLeads: leads.length,
      updatedLeads: updatedCount,
      timestamp: Date.now(),
    };
  },
});

// Internal mutation: Publish scheduled posts
export const publishScheduledPosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find posts scheduled for publishing
    const scheduledPosts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "SCHEDULED"))
      .filter((q) => q.lte(q.field("scheduledFor"), now))
      .collect();
    
    let publishedCount = 0;
    
    for (const post of scheduledPosts) {
      await ctx.db.patch(post._id, {
        status: "PUBLISHED",
        publishedAt: now,
        scheduledFor: undefined,
      });
      publishedCount++;
      
      console.log(`Published scheduled post: ${post.titleEn}`);
    }
    
    if (publishedCount > 0) {
      console.log(`Published ${publishedCount} scheduled posts`);
    }
    
    return {
      publishedCount,
      timestamp: now,
    };
  },
});

// Internal mutation: Cleanup old analytics data
export const cleanupOldAnalytics = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Keep analytics data for 2 years
    const cutoffDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    console.log(`Cleaning up analytics data older than ${cutoffDateStr}`);
    
    // Get old analytics records
    const oldAnalytics = await ctx.db
      .query("blogAnalytics")
      .withIndex("by_date", (q) => q.lt("date", cutoffDateStr))
      .collect();
    
    // Get old SEO metrics
    const oldSeoMetrics = await ctx.db
      .query("seoMetrics")
      .filter((q) => q.lt(q.field("date"), cutoffDateStr))
      .collect();
    
    let deletedCount = 0;
    
    // Delete old analytics
    for (const record of oldAnalytics) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }
    
    // Delete old SEO metrics
    for (const record of oldSeoMetrics) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }
    
    console.log(`Cleaned up ${deletedCount} old analytics records`);
    
    return {
      deletedRecords: deletedCount,
      cutoffDate: cutoffDateStr,
      timestamp: Date.now(),
    };
  },
});

// Internal action: Prepare weekly newsletter
export const prepareWeeklyNewsletter = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Preparing weekly newsletter");
    
    // Get top content from the past week
    const analytics = await ctx.runQuery(api.analytics.getBlogAnalytics, {
      timeframe: "week",
    });
    
    // Get trending content
    const trending = await ctx.runQuery(api.recommendations.getTrendingContent, {
      type: "all",
      timeframe: "week",
      limit: 5,
    });
    
    // Prepare newsletter content
    const newsletter = {
      week: new Date().toISOString().split('T')[0],
      topPosts: analytics.topPosts.slice(0, 3),
      trendingContent: trending,
      weeklyStats: {
        totalViews: analytics.totalViews,
        totalShares: analytics.totalShares,
        totalComments: analytics.totalComments,
      },
      generatedAt: Date.now(),
    };
    
    console.log(`Newsletter prepared with ${newsletter.topPosts.length} top posts and ${newsletter.trendingContent.length} trending items`);
    
    return newsletter;
  },
});

// Internal mutation: Reset AI model quotas
export const resetAiModelQuotas = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Resetting AI model quotas for new day");
    
    // In a production system, this would reset quota counters
    // For now, we'll just log the reset
    
    const resetTime = Date.now();
    
    console.log(`AI model quotas reset at ${new Date(resetTime).toISOString()}`);
    
    return {
      resetTime,
      models: [
        { id: "gemini-2.5-flash", quotaReset: true },
        { id: "gemini-1.5-flash", quotaReset: true },
        { id: "gemini-1.5-flash-8b", quotaReset: true },
      ],
    };
  },
});
