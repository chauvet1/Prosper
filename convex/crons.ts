import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily blog analytics aggregation (runs at 1 AM UTC)
crons.daily(
  "aggregate daily analytics",
  { hourUTC: 1, minuteUTC: 0 },
  internal.scheduledFunctions.aggregateDailyAnalytics
);

// Weekly SEO report generation (runs every Monday at 9 AM UTC)
crons.weekly(
  "generate weekly SEO report",
  { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
  internal.scheduledFunctions.generateWeeklySeoReport
);

// Monthly content performance review (runs on 1st of each month at 10 AM UTC)
crons.monthly(
  "monthly content performance review",
  { day: 1, hourUTC: 10, minuteUTC: 0 },
  internal.scheduledFunctions.monthlyContentReview
);

// Daily lead scoring update (runs every 6 hours)
crons.interval(
  "update lead scores",
  { hours: 6 },
  internal.scheduledFunctions.updateLeadScores
);

// Hourly blog post publishing (for scheduled posts)
crons.hourly(
  "publish scheduled posts",
  { minuteUTC: 0 },
  internal.scheduledFunctions.publishScheduledPosts
);

// Daily cleanup of old analytics data (runs at 2 AM UTC)
crons.daily(
  "cleanup old analytics",
  { hourUTC: 2, minuteUTC: 0 },
  internal.scheduledFunctions.cleanupOldAnalytics
);

// Weekly newsletter preparation (runs every Friday at 3 PM UTC)
crons.weekly(
  "prepare weekly newsletter",
  { dayOfWeek: "friday", hourUTC: 15, minuteUTC: 0 },
  internal.scheduledFunctions.prepareWeeklyNewsletter
);

// Daily AI model quota reset (runs at midnight UTC)
crons.daily(
  "reset AI model quotas",
  { hourUTC: 0, minuteUTC: 0 },
  internal.scheduledFunctions.resetAiModelQuotas
);

export default crons;
