import cron from 'node-cron';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

// Read schedule from .env or use default (every day at 8:00 AM)
const SCHEDULE = process.env.BLOG_GEN_SCHEDULE || '0 8 * * *';

console.log('⏰ Blog generation schedule:', SCHEDULE);

cron.schedule(SCHEDULE, async () => {
  console.log('🚀 Running scheduled blog generation at', new Date().toISOString());
  try {
    await import('./test-real-blog-generation');
  } catch (error) {
    console.error('❌ Scheduled blog generation failed:', error);
  }
});

console.log('✅ Blog generation scheduler started.');
