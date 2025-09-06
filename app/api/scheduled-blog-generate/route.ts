import { NextRequest, NextResponse } from 'next/server';
import { testRealBlogGeneration } from '@/scripts/test-real-blog-generation';

// POST /api/scheduled-blog-generate - Trigger scheduled blog generation (for Vercel Cron)
export async function POST(request: NextRequest) {
  try {
    // Optionally, you could add a secret check here for security
    const result = await testRealBlogGeneration();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Scheduled blog generation failed:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Optionally, allow GET for manual trigger/testing
export async function GET(request: NextRequest) {
  return POST(request);
}
